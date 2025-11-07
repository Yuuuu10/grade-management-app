<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'rule_id',
        'location_id',
        'created_by',
        'played_at',
        'notes',
    ];

    protected $casts = [
        'played_at' => 'datetime',
    ];

    public function rule()
    {
        return $this->belongsTo(Rule::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function players()
    {
        return $this->hasMany(GamePlayer::class);
    }
}
