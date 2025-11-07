<?php

namespace App\Http\Controllers;

use App\Models\GamePlayer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScoreController extends Controller
{
    /**
     * 全体統計
     */
    public function statistics(Request $request)
    {
        $stats = GamePlayer::select(
            'user_id',
            DB::raw('COUNT(*) as total_games'),
            DB::raw('SUM(CASE WHEN rank = 1 THEN 1 ELSE 0 END) as first_place'),
            DB::raw('SUM(CASE WHEN rank = 2 THEN 1 ELSE 0 END) as second_place'),
            DB::raw('SUM(CASE WHEN rank = 3 THEN 1 ELSE 0 END) as third_place'),
            DB::raw('SUM(CASE WHEN rank = 4 THEN 1 ELSE 0 END) as fourth_place'),
            DB::raw('SUM(calculated_score) as total_score'),
            DB::raw('AVG(calculated_score) as average_score')
        )
            ->with('user')
            ->groupBy('user_id')
            ->get();

        return response()->json($stats);
    }

    /**
     * ユーザー別統計
     */
    public function userStatistics(Request $request, $userId)
    {
        $stats = GamePlayer::where('user_id', $userId)
            ->select(
                DB::raw('COUNT(*) as total_games'),
                DB::raw('SUM(CASE WHEN rank = 1 THEN 1 ELSE 0 END) as first_place'),
                DB::raw('SUM(CASE WHEN rank = 2 THEN 1 ELSE 0 END) as second_place'),
                DB::raw('SUM(CASE WHEN rank = 3 THEN 1 ELSE 0 END) as third_place'),
                DB::raw('SUM(CASE WHEN rank = 4 THEN 1 ELSE 0 END) as fourth_place'),
                DB::raw('SUM(calculated_score) as total_score'),
                DB::raw('AVG(calculated_score) as average_score'),
                DB::raw('MAX(calculated_score) as max_score'),
                DB::raw('MIN(calculated_score) as min_score')
            )
            ->first();

        $user = User::find($userId);

        return response()->json([
            'user' => $user,
            'statistics' => $stats,
        ]);
    }

    /**
     * ランキング
     */
    public function ranking(Request $request)
    {
        $ranking = GamePlayer::select(
            'user_id',
            DB::raw('COUNT(*) as total_games'),
            DB::raw('SUM(calculated_score) as total_score'),
            DB::raw('AVG(calculated_score) as average_score')
        )
            ->with('user')
            ->groupBy('user_id')
            ->having('total_games', '>=', 3) // 最低3ゲーム以上
            ->orderBy('average_score', 'desc')
            ->get();

        return response()->json($ranking);
    }
}
