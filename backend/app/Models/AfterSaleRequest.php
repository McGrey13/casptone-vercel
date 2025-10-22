<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AfterSaleRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'order_id',
        'product_id',
        'customer_id',
        'seller_id',
        'request_type',
        'status',
        'subject',
        'description',
        'reason',
        'images',
        'video_path',
        'refund_amount',
        'seller_response',
        'admin_notes',
        'responded_at',
        'resolved_at',
    ];

    protected $casts = [
        'images' => 'array',
        'refund_amount' => 'decimal:2',
        'responded_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    /**
     * Generate unique request ID (ASR-XXXXXX format)
     */
    public static function generateRequestId()
    {
        do {
            $requestId = 'ASR-' . str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (self::where('request_id', $requestId)->exists());

        return $requestId;
    }

    /**
     * Boot method to auto-generate request_id
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($request) {
            if (empty($request->request_id)) {
                $request->request_id = self::generateRequestId();
            }
        });
    }

    /**
     * Get the order associated with this request
     */
    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    /**
     * Get the product associated with this request (if any)
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Get the customer who made this request
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'customerID');
    }

    /**
     * Get the seller involved in this request
     */
    public function seller()
    {
        return $this->belongsTo(Seller::class, 'seller_id', 'sellerID');
    }

    /**
     * Scope for pending requests
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for a specific customer
     */
    public function scopeForCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    /**
     * Scope for a specific seller
     */
    public function scopeForSeller($query, $sellerId)
    {
        return $query->where('seller_id', $sellerId);
    }

    /**
     * Check if request can be cancelled
     */
    public function canBeCancelled()
    {
        return in_array($this->status, ['pending', 'approved', 'processing']);
    }

    /**
     * Check if request can be responded to
     */
    public function canBeResponded()
    {
        return $this->status === 'pending';
    }
}

