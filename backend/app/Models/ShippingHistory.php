<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'shipping_id',
        'status',
        'description',
        'location',
        'timestamp'
    ];

    protected $casts = [
        'timestamp' => 'datetime'
    ];

    /**
     * Get the shipping that owns the history
     */
    public function shipping()
    {
        return $this->belongsTo(Shipping::class);
    }

    /**
     * Scope to order by timestamp
     */
    public function scopeOrderByTimestamp($query, $direction = 'desc')
    {
        return $query->orderBy('timestamp', $direction);
    }

    /**
     * Scope to filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
