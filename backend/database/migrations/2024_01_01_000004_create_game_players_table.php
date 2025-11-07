<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('rank'); // 順位 (1-4)
            $table->integer('score'); // 素点
            $table->decimal('calculated_score', 10, 2); // 計算後のスコア（ウマオカ適用後）
            $table->timestamps();
            
            $table->unique(['game_id', 'user_id']); // 同じゲームに同じユーザーは1回のみ
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_players');
    }
};
