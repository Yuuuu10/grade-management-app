<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GamePlayer;
use App\Models\Rule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GameController extends Controller
{
    /**
     * ゲーム一覧取得
     */
    public function index(Request $request)
    {
        $games = Game::with(['rule', 'location', 'creator', 'players.user'])
            ->where('created_by', $request->user()->id)
            ->orWhereHas('players', function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->orderBy('played_at', 'desc')
            ->get();

        return response()->json($games);
    }

    /**
     * ゲーム作成
     */
    public function store(Request $request)
    {
        $request->validate([
            'rule_id' => 'required|exists:rules,id',
            'location_id' => 'nullable|exists:locations,id',
            'played_at' => 'required|date',
            'notes' => 'nullable|string',
            'players' => 'required|array|size:4',
            'players.*.user_id' => 'required|exists:users,id',
            'players.*.rank' => 'required|integer|min:1|max:4',
            'players.*.score' => 'required|integer',
        ]);

        DB::beginTransaction();

        try {
            $game = Game::create([
                'rule_id' => $request->rule_id,
                'location_id' => $request->location_id,
                'created_by' => $request->user()->id,
                'played_at' => $request->played_at,
                'notes' => $request->notes,
            ]);

            $rule = Rule::find($request->rule_id);

            foreach ($request->players as $playerData) {
                $calculatedScore = $rule->calculateScore(
                    $playerData['rank'],
                    $playerData['score']
                );

                GamePlayer::create([
                    'game_id' => $game->id,
                    'user_id' => $playerData['user_id'],
                    'rank' => $playerData['rank'],
                    'score' => $playerData['score'],
                    'calculated_score' => $calculatedScore,
                ]);
            }

            DB::commit();

            $game->load(['rule', 'location', 'creator', 'players.user']);

            return response()->json($game, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'ゲームの作成に失敗しました'], 500);
        }
    }

    /**
     * ゲーム詳細取得
     */
    public function show(Request $request, Game $game)
    {
        $game->load(['rule', 'location', 'creator', 'players.user']);
        return response()->json($game);
    }

    /**
     * ユーザーのゲーム一覧取得
     */
    public function getUserGames(Request $request, $userId)
    {
        $games = Game::with(['rule', 'location', 'creator', 'players.user'])
            ->whereHas('players', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->orderBy('played_at', 'desc')
            ->get();

        return response()->json($games);
    }

    /**
     * ゲーム更新
     */
    public function update(Request $request, Game $game)
    {
        // 作成者かチェック
        if ($game->created_by !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $request->validate([
            'rule_id' => 'exists:rules,id',
            'location_id' => 'nullable|exists:locations,id',
            'played_at' => 'date',
            'notes' => 'nullable|string',
            'players' => 'array|size:4',
            'players.*.user_id' => 'required|exists:users,id',
            'players.*.rank' => 'required|integer|min:1|max:4',
            'players.*.score' => 'required|integer',
        ]);

        DB::beginTransaction();

        try {
            $game->update($request->only(['rule_id', 'location_id', 'played_at', 'notes']));

            if ($request->has('players')) {
                // 既存のプレイヤーを削除
                $game->players()->delete();

                $rule = Rule::find($game->rule_id);

                // 新しいプレイヤーを追加
                foreach ($request->players as $playerData) {
                    $calculatedScore = $rule->calculateScore(
                        $playerData['rank'],
                        $playerData['score']
                    );

                    GamePlayer::create([
                        'game_id' => $game->id,
                        'user_id' => $playerData['user_id'],
                        'rank' => $playerData['rank'],
                        'score' => $playerData['score'],
                        'calculated_score' => $calculatedScore,
                    ]);
                }
            }

            DB::commit();

            $game->load(['rule', 'location', 'creator', 'players.user']);

            return response()->json($game);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'ゲームの更新に失敗しました'], 500);
        }
    }

    /**
     * ゲーム削除
     */
    public function destroy(Request $request, Game $game)
    {
        // 作成者かチェック
        if ($game->created_by !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $game->delete();

        return response()->json(['message' => 'ゲームを削除しました']);
    }
}
