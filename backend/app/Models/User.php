<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'area',
        'profile',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function rules()
    {
        return $this->hasMany(Rule::class);
    }

    public function locations()
    {
        return $this->hasMany(Location::class);
    }

    public function gamePlayers()
    {
        return $this->hasMany(GamePlayer::class);
    }

    public function createdGames()
    {
        return $this->hasMany(Game::class, 'created_by');
    }

    public function sentOffers()
    {
        return $this->hasMany(Offer::class, 'from_user_id');
    }

    public function receivedOffers()
    {
        return $this->hasMany(Offer::class, 'to_user_id');
    }

    public function offerMessages()
    {
        return $this->hasMany(OfferMessage::class, 'sender_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
