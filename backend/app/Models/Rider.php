<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rider extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'rider_name',
        'rider_phone',
        'rider_email',
        'rider_company',
        'vehicle_type',
        'vehicle_number',
        'delivery_count',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'delivery_count' => 'integer',
    ];

    /**
     * Get the seller that owns this rider
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class, 'seller_id', 'sellerID');
    }

    /**
     * Increment delivery count
     */
    public function incrementDeliveryCount()
    {
        $this->increment('delivery_count');
    }
}
