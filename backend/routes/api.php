<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RuleController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\ScoreController;

// 認証不要のルート
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// 認証が必要なルート
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // ルール設定
    Route::apiResource('rules', RuleController::class);

    // 場所
    Route::apiResource('locations', LocationController::class);

    // ゲーム（成績）
    Route::apiResource('games', GameController::class);
    Route::get('/games/user/{userId}', [GameController::class, 'getUserGames']);

    // スコア統計
    Route::get('/scores/statistics', [ScoreController::class, 'statistics']);
    Route::get('/scores/user/{userId}', [ScoreController::class, 'userStatistics']);
    Route::get('/scores/ranking', [ScoreController::class, 'ranking']);
});
