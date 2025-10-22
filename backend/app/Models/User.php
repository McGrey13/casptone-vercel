<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'userID';

    protected $fillable = [
        'userName',
        'userEmail',
        'userPassword',
        'userContactNumber',
        'userAddress',
        'userCity',
        'userRegion',
        'userProvince',
        'userPostalCode',
        'role',
        'otp',
        'otp_expires_at',
        'is_verified',
        'last_activity_at',
    ];

    protected $hidden = [
        'userPassword',
        'remember_token',
        'otp', 
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'userBirthday' => 'date', 
        'otp_expires_at' => 'datetime',
        'is_verified' => 'boolean',
        'last_activity_at' => 'datetime',
    ];

    /**
     * Override default password field
     */
    public function getAuthPassword()
    {
        return $this->userPassword;
    }

    /**
     * Override default email field
     */
    public function getAuthIdentifierName()
    {
        return 'userEmail';
    }

    //RELATIONSHIPS
    public function administrator(): HasOne
    {
        return $this->hasOne(Administrator::class, 'user_id', 'userID');
    }

    public function seller(): HasOne
    {
        return $this->hasOne(Seller::class, 'user_id', 'userID');
    }

    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class, 'user_id', 'userID');
    }

    // Allow accessing $user->email instead of $user->userEmail
    public function getEmailAttribute()
    {
        return $this->userEmail;
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class, 'userID', 'userID');
    }
    
    public function followedSellers()
    {
        return $this->belongsToMany(Seller::class, 'seller_follows', 'userID', 'sellerID')->withTimestamps();
    }
    
}



