<?php

namespace App\Http\Controllers;

use App\Models\Offer;
use App\Models\OfferMessage;
use App\Models\User;
use Illuminate\Http\Request;

class MatchingController extends Controller
{
    public function users(Request $request)
    {
        $request->validate([
            'role' => 'nullable|in:parlor,pro',
            'q' => 'nullable|string|max:255',
        ]);

        $authUser = $request->user();
        $targetRole = $request->role ?? ($authUser->role === 'parlor' ? 'pro' : 'parlor');

        $query = User::query()
            ->where('role', $targetRole)
            ->where('id', '!=', $authUser->id);

        if ($request->filled('q')) {
            $keyword = $request->q;
            $query->where(function ($subQuery) use ($keyword) {
                $subQuery->where('name', 'like', "%{$keyword}%")
                    ->orWhere('area', 'like', "%{$keyword}%")
                    ->orWhere('profile', 'like', "%{$keyword}%");
            });
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')
                ->paginate(20)
        );
    }

    public function createOffer(Request $request)
    {
        $request->validate([
            'to_user_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'message' => 'nullable|string|max:2000',
        ]);

        $authUser = $request->user();
        $toUser = User::findOrFail($request->to_user_id);

        if ($authUser->id === $toUser->id) {
            return response()->json(['message' => '自分自身にはオファーできません'], 422);
        }

        if (!in_array($authUser->role, ['parlor', 'pro'], true) || !in_array($toUser->role, ['parlor', 'pro'], true)) {
            return response()->json(['message' => 'このユーザーにはオファーできません'], 422);
        }

        if ($authUser->role === $toUser->role) {
            return response()->json(['message' => '同じロール同士ではオファーできません'], 422);
        }

        $offer = Offer::create([
            'from_user_id' => $authUser->id,
            'to_user_id' => $toUser->id,
            'title' => $request->title,
            'message' => $request->message,
            'status' => Offer::STATUS_PENDING,
        ]);

        $offer->load(['fromUser', 'toUser']);

        return response()->json($offer, 201);
    }

    public function offers(Request $request)
    {
        $request->validate([
            'status' => 'nullable|in:pending,accepted,rejected,in_progress,completed,cancelled',
        ]);

        $authUser = $request->user();
        $query = Offer::with(['fromUser', 'toUser'])
            ->withCount('messages')
            ->where(function ($subQuery) use ($authUser) {
                $subQuery->where('from_user_id', $authUser->id)
                    ->orWhere('to_user_id', $authUser->id);
            });

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $offers = $query->orderBy('updated_at', 'desc')->get()->map(function (Offer $offer) use ($authUser) {
            $counterpart = $offer->from_user_id === $authUser->id ? $offer->toUser : $offer->fromUser;
            return [
                'id' => $offer->id,
                'title' => $offer->title,
                'message' => $offer->message,
                'status' => $offer->status,
                'responded_at' => $offer->responded_at,
                'created_at' => $offer->created_at,
                'updated_at' => $offer->updated_at,
                'is_sender' => $offer->from_user_id === $authUser->id,
                'counterpart' => $counterpart,
                'messages_count' => $offer->messages_count,
            ];
        });

        return response()->json($offers);
    }

    public function updateOfferStatus(Request $request, Offer $offer)
    {
        $request->validate([
            'status' => 'required|in:accepted,rejected,in_progress,completed,cancelled',
        ]);

        $authUser = $request->user();
        if (!$this->isParticipant($offer, $authUser->id)) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $nextStatus = $request->status;
        $isRecipient = $offer->to_user_id === $authUser->id;
        $isSender = $offer->from_user_id === $authUser->id;

        if (in_array($nextStatus, [Offer::STATUS_ACCEPTED, Offer::STATUS_REJECTED], true) && !$isRecipient) {
            return response()->json(['message' => '受信者のみ実行できます'], 422);
        }

        if ($nextStatus === Offer::STATUS_CANCELLED && !$isSender) {
            return response()->json(['message' => '送信者のみキャンセルできます'], 422);
        }

        if ($nextStatus === Offer::STATUS_IN_PROGRESS && !in_array($offer->status, [Offer::STATUS_ACCEPTED, Offer::STATUS_IN_PROGRESS], true)) {
            return response()->json(['message' => 'この状態には変更できません'], 422);
        }

        if ($nextStatus === Offer::STATUS_COMPLETED && !in_array($offer->status, [Offer::STATUS_ACCEPTED, Offer::STATUS_IN_PROGRESS], true)) {
            return response()->json(['message' => '完了にできるのはやり取り成立後のみです'], 422);
        }

        if (in_array($nextStatus, [Offer::STATUS_ACCEPTED, Offer::STATUS_REJECTED, Offer::STATUS_CANCELLED], true) && $offer->status !== Offer::STATUS_PENDING) {
            return response()->json(['message' => 'この状態には変更できません'], 422);
        }

        $offer->status = $nextStatus;
        $offer->responded_at = now();
        $offer->save();

        return response()->json($offer->fresh(['fromUser', 'toUser']));
    }

    public function messages(Request $request, Offer $offer)
    {
        if (!$this->isParticipant($offer, $request->user()->id)) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $messages = OfferMessage::with('sender')
            ->where('offer_id', $offer->id)
            ->orderBy('created_at')
            ->get();

        return response()->json($messages);
    }

    public function sendMessage(Request $request, Offer $offer)
    {
        $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $authUser = $request->user();
        if (!$this->isParticipant($offer, $authUser->id)) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        if (!in_array($offer->status, [Offer::STATUS_ACCEPTED, Offer::STATUS_IN_PROGRESS, Offer::STATUS_COMPLETED], true)) {
            return response()->json(['message' => 'このステータスではメッセージできません'], 422);
        }

        $message = OfferMessage::create([
            'offer_id' => $offer->id,
            'sender_id' => $authUser->id,
            'body' => $request->body,
        ]);

        if ($offer->status === Offer::STATUS_ACCEPTED) {
            $offer->status = Offer::STATUS_IN_PROGRESS;
            $offer->save();
        }

        return response()->json($message->load('sender'), 201);
    }

    private function isParticipant(Offer $offer, int $userId): bool
    {
        return $offer->from_user_id === $userId || $offer->to_user_id === $userId;
    }
}
