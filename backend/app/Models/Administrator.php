<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Model;

// class Administrator extends Model
// {
//     protected $fillable = [
//         'user_id',
//         'adminEmail',
//         'adminPassword',
//     ];

//     protected $hidden = [
//         'adminPassword',
//     ];

//     public function user()
//     {
//         return $this->belongsTo(User::class);
//     }


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Administrator extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'adminID';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'profile_picture_path',
        // If you had specific admin-only fields not in User, they would go here.
    ];

    /**
     * Get the user that owns the administrator profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'userID');
    }
} 