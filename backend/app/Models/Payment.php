<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $primaryKey = 'payment_id';
    
    protected $fillable = [
        'userID',
        'orderID',
        'paymentMethod',
        'paymentStatus',
        'amount',
        'currency',
        'paymongo_payment_id',
        'paymongo_payment_intent_id',
        'paymongo_source_id',
        'payment_details',
        'shippingAddress',
        'orderDate',
        'shippingDate',
        'deliveryDate',
        'notes',
        'attempt_count',
        'last_attempt_at',
        'failure_reason',
        'payment_type', // online, cod
        'reference_number' // For COD or other payment references
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_details' => 'array',
        'orderDate' => 'date',
        'shippingDate' => 'date',
        'deliveryDate' => 'date',
        'last_attempt_at' => 'datetime',
    ];

    // PayMongo Integration Methods
    public function createPaymongoPayment()
    {
        try {
            $paymongoSecret = config('services.paymongo.secret_key');
            $client = new \GuzzleHttp\Client();

            $response = $client->post('https://api.paymongo.com/v1/payment_intents', [
                'headers' => [
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Basic ' . base64_encode($paymongoSecret . ':')
                ],
                'json' => [
                    'data' => [
                        'attributes' => [
                            'amount' => $this->amount * 100, // Convert to cents
                            'payment_method_allowed' => [$this->paymentMethod],
                            'currency' => $this->currency,
                            'description' => 'Payment for Order #' . $this->orderID,
                        ]
                    ]
                ]
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            
            $this->update([
                'paymongo_payment_intent_id' => $result['data']['id'],
                'payment_details' => $result,
                'paymentStatus' => 'processing',
                'attempt_count' => $this->attempt_count + 1,
                'last_attempt_at' => now()
            ]);

            return $result;
        } catch (\Exception $e) {
            $this->update([
                'paymentStatus' => 'failed',
                'failure_reason' => $e->getMessage(),
                'attempt_count' => $this->attempt_count + 1,
                'last_attempt_at' => now()
            ]);
            throw $e;
        }
    }

    public function verifyPaymongoPayment($paymentIntentId)
    {
        try {
            $paymongoSecret = config('services.paymongo.secret_key');
            $client = new \GuzzleHttp\Client();

            $response = $client->get("https://api.paymongo.com/v1/payment_intents/{$paymentIntentId}", [
                'headers' => [
                    'Accept' => 'application/json',
                    'Authorization' => 'Basic ' . base64_encode($paymongoSecret . ':')
                ]
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            $status = $result['data']['attributes']['status'];

            $this->update([
                'paymentStatus' => $this->mapPaymongoStatus($status),
                'payment_details' => array_merge($this->payment_details ?? [], $result),
                'last_attempt_at' => now()
            ]);

            return $result;
        } catch (\Exception $e) {
            $this->update([
                'failure_reason' => $e->getMessage(),
                'last_attempt_at' => now()
            ]);
            throw $e;
        }
    }

    private function mapPaymongoStatus($paymongoStatus)
    {
        return match($paymongoStatus) {
            'succeeded' => 'paid',
            'awaiting_payment_method' => 'pending',
            'processing' => 'processing',
            'failed' => 'failed',
            default => 'pending'
        };
    }


    public function user()
    {
        return $this->belongsTo(User::class, 'userID', 'userID');
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'orderID', 'orderID');
    }

    // Payment type methods
    public function isOnlinePayment()
    {
        return $this->payment_type === 'online';
    }

    public function isCODPayment()
    {
        return $this->payment_type === 'cod' || $this->paymentMethod === 'cod';
    }

    public function isGCashPayment()
    {
        return $this->isOnlinePayment() && $this->paymentMethod === 'gcash';
    }

    public function isPayMayaPayment()
    {
        return $this->isOnlinePayment() && $this->paymentMethod === 'paymaya';
    }

    public function isCardPayment()
    {
        return $this->isOnlinePayment() && $this->paymentMethod === 'card';
    }

    // Get payment method display name
    public function getPaymentMethodDisplayAttribute()
    {
        return match($this->paymentMethod) {
            'gcash' => 'GCash',
            'paymaya' => 'PayMaya',
            'cod' => 'Cash on Delivery',
            default => ucfirst($this->paymentMethod)
        };
    }

    // Scopes
    public function scopeOnlinePayments($query)
    {
        return $query->where('payment_type', 'online');
    }


    public function scopeGCashPayments($query)
    {
        return $query->where('payment_type', 'online')->where('paymentMethod', 'gcash');
    }

    public function scopePayMayaPayments($query)
    {
        return $query->where('payment_type', 'online')->where('paymentMethod', 'paymaya');
    }

    public function scopeCardPayments($query)
    {
        return $query->where('payment_type', 'online')->where('paymentMethod', 'card');
    }

    public function scopeCODPayments($query)
    {
        return $query->where('payment_type', 'cod')->orWhere('paymentMethod', 'cod');
    }
}
