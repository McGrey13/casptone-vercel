<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentMethod extends Model
{
    protected $fillable = [
        'user_id',
        'paymongo_payment_method_id',
        'type',
        'details',
        'billing',
        'is_default',
        'is_active'
    ];

    protected $casts = [
        'details' => 'array',
        'billing' => 'array',
        'is_default' => 'boolean',
        'is_active' => 'boolean'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'userID');
    }

    public function getMaskedDetailsAttribute()
    {
        $details = $this->details;
        
        if ($this->type === 'card') {
            if (isset($details['last4'])) {
                return [
                    'brand' => $details['brand'] ?? 'Unknown',
                    'last4' => $details['last4'],
                    'exp_month' => $details['exp_month'] ?? null,
                    'exp_year' => $details['exp_year'] ?? null,
                ];
            }
        } elseif (in_array($this->type, ['gcash', 'grab_pay', 'paymaya'])) {
            if (isset($details['phone'])) {
                $phone = $details['phone'];
                return [
                    'type' => $this->type,
                    'phone' => substr($phone, 0, 4) . '****' . substr($phone, -4),
                ];
            }
        }
        
        return $details;
    }
}
