<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rule extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'starting_points',
        'return_points',
        'uma_1',
        'uma_2',
        'uma_3',
        'uma_4',
        'oka',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function games()
    {
        return $this->hasMany(Game::class);
    }

    /**
     * 計算されたスコアを返す
     */
    public function calculateScore($rank, $rawScore)
    {
        // 素点から返し点を引いて、1000で割る
        $baseScore = ($rawScore - $this->return_points) / 1000;
        
        // ウマを追加
        $uma = 0;
        switch ($rank) {
            case 1:
                $uma = $this->uma_1;
                break;
            case 2:
                $uma = $this->uma_2;
                break;
            case 3:
                $uma = $this->uma_3;
                break;
            case 4:
                $uma = $this->uma_4;
                break;
        }
        
        // オカは1位のみ
        $oka = ($rank === 1) ? $this->oka : 0;
        
        return $baseScore + $uma + $oka;
    }
}
