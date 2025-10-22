<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'seller_id',
        'paymongo_payment_id',
        'paymongo_intent_id',
        'gross_amount',
        'admin_fee',
        'seller_amount',
        'status',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
        'gross_amount' => 'integer',
        'admin_fee' => 'integer',
        'seller_amount' => 'integer',
    ];

    // Relationships
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'orderID');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class, 'seller_id', 'sellerID');
    }

    // Helper methods
    public function getGrossAmountInPesosAttribute(): float
    {
        return $this->gross_amount / 100;
    }

    public function getAdminFeeInPesosAttribute(): float
    {
        return $this->admin_fee / 100;
    }

    public function getSellerAmountInPesosAttribute(): float
    {
        return $this->seller_amount / 100;
    }

    // Scope for successful transactions
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'succeeded');
    }

    // Scope for pending transactions
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
