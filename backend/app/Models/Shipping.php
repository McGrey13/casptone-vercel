<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shipping extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'tracking_number',
        'rider_name',
        'rider_phone',
        'rider_email',
        'rider_company',
        'vehicle_type',
        'vehicle_number',
        'delivery_address',
        'delivery_city',
        'delivery_province',
        'delivery_notes',
        'estimated_delivery',
        'status',
        'assigned_at',
        'shipped_at',
        'delivered_at'
    ];

    protected $casts = [
        'estimated_delivery' => 'datetime',
        'assigned_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime'
    ];

    /**
     * Get the order that owns the shipping
     */
    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'orderID');
    }

    /**
     * Get the shipping histories for the shipping
     */
    public function histories()
    {
        return $this->hasMany(ShippingHistory::class);
    }

    /**
     * Get the latest shipping history
     */
    public function latestHistory()
    {
        return $this->hasOne(ShippingHistory::class)->latest('timestamp');
    }

    /**
     * Scope to filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter by tracking number
     */
    public function scopeByTrackingNumber($query, $trackingNumber)
    {
        return $query->where('tracking_number', $trackingNumber);
    }
}
