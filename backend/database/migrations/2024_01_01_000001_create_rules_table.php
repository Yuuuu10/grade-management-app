<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name'); // ルール名
            $table->integer('starting_points')->default(25000); // 開始点
            $table->integer('return_points')->default(30000); // 返し点
            $table->integer('uma_1')->default(20); // 1位のウマ
            $table->integer('uma_2')->default(10); // 2位のウマ
            $table->integer('uma_3')->default(-10); // 3位のウマ
            $table->integer('uma_4')->default(-20); // 4位のウマ
            $table->integer('oka')->default(0); // オカ
            $table->boolean('is_default')->default(false); // デフォルトルールかどうか
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rules');
    }
};
