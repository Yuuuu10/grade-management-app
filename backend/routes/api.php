<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RuleController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\ScoreController;
use App\Http\Controllers\MatchingController;
use App\Http\Controllers\AdminController;

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

    // マッチング
    Route::get('/matching/users', [MatchingController::class, 'users']);
    Route::post('/matching/offers', [MatchingController::class, 'createOffer']);
    Route::get('/matching/offers', [MatchingController::class, 'offers']);
    Route::patch('/matching/offers/{offer}/status', [MatchingController::class, 'updateOfferStatus']);
    Route::get('/matching/offers/{offer}/messages', [MatchingController::class, 'messages']);
    Route::post('/matching/offers/{offer}/messages', [MatchingController::class, 'sendMessage']);

    // 管理画面
    Route::get('/admin/overview', [AdminController::class, 'overview']);
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::get('/admin/offers', [AdminController::class, 'offers']);
});
