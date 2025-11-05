<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BrowsingHistory extends Model
{
    protected $table = 'browsing_history';
    
    protected $fillable = [
        'user_id',
        'product_id',
        'session_id',
        'view_duration',
        'viewed_at',
        'ip_address',
        'user_agent',
    ];
    
    protected $casts = [
        'viewed_at' => 'datetime',
        'view_duration' => 'integer',
    ];
    
    /**
     * Get the user that owns the browsing history.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'userID');
    }
    
    /**
     * Get the product that was viewed.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}
