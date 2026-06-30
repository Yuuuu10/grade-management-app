<?php

namespace App\Http\Controllers;

use App\Models\Offer;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function overview(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => '管理者権限が必要です'], 403);
        }

        return response()->json([
            'users' => [
                'total' => User::count(),
                'parlor' => User::where('role', 'parlor')->count(),
                'pro' => User::where('role', 'pro')->count(),
                'admin' => User::where('role', 'admin')->count(),
            ],
            'offers' => [
                'total' => Offer::count(),
                'pending' => Offer::where('status', Offer::STATUS_PENDING)->count(),
                'accepted' => Offer::where('status', Offer::STATUS_ACCEPTED)->count(),
                'in_progress' => Offer::where('status', Offer::STATUS_IN_PROGRESS)->count(),
                'completed' => Offer::where('status', Offer::STATUS_COMPLETED)->count(),
                'rejected' => Offer::where('status', Offer::STATUS_REJECTED)->count(),
                'cancelled' => Offer::where('status', Offer::STATUS_CANCELLED)->count(),
            ],
        ]);
    }

    public function users(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => '管理者権限が必要です'], 403);
        }

        $users = User::query()
            ->select(['id', 'name', 'email', 'role', 'phone', 'area', 'created_at'])
            ->withCount('sentOffers', 'receivedOffers')
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        return response()->json($users);
    }

    public function offers(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => '管理者権限が必要です'], 403);
        }

        $offers = Offer::with(['fromUser:id,name,role,area', 'toUser:id,name,role,area'])
            ->withCount('messages')
            ->orderBy('created_at', 'desc')
            ->limit(200)
            ->get();

        return response()->json($offers);
    }
}
