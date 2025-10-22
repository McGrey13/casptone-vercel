<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SellerBalance extends Model
{
    use HasFactory;

    protected $fillable = [
        'seller_id',
        'available_balance',
        'pending_balance'
    ];

    protected $casts = [
        'available_balance' => 'integer',
        'pending_balance' => 'integer',
    ];

    // Relationships
    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class, 'seller_id', 'sellerID');
    }


    // Helper methods
    public function getAvailableBalanceInPesosAttribute(): float
    {
        return $this->available_balance / 100;
    }

    public function getPendingBalanceInPesosAttribute(): float
    {
        return $this->pending_balance / 100;
    }

    public function getTotalBalanceInPesosAttribute(): float
    {
        return ($this->available_balance + $this->pending_balance) / 100;
    }

    // Add to available balance
    public function addToAvailableBalance(int $amount): void
    {
        $this->increment('available_balance', $amount);
    }

    // Add to pending balance
    public function addToPendingBalance(int $amount): void
    {
        $this->increment('pending_balance', $amount);
    }

    // Move from pending to available
    public function movePendingToAvailable(int $amount): void
    {
        $this->decrement('pending_balance', $amount);
        $this->increment('available_balance', $amount);
    }

    // Add to seller balance (direct payment from customer)
    public function addToSellerBalance(int $amount): void
    {
        $this->increment('available_balance', $amount);
    }
}
