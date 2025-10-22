<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class PayMongoService
{
    private string $secretKey;
    private string $publicKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->secretKey = config('services.paymongo.secret_key');
        $this->publicKey = config('services.paymongo.public_key');
        $this->baseUrl = config('services.paymongo.base_url', 'https://api.paymongo.com/v1');
    }

    /**
     * Create a payment intent
     */
    public function createPaymentIntent(array $data): array
    {
        try {
            $payload = [
                'data' => [
                    'attributes' => [
                        'amount' => $data['amount_cents'],
                        'currency' => $data['currency'] ?? 'PHP',
                        'payment_method_allowed' => $data['payment_methods'] ?? ['gcash', 'grab_pay', 'card'],
                        'description' => $data['description'] ?? 'Payment for Order',
                        'metadata' => $data['metadata'] ?? []
                    ]
                ]
            ];

            $response = Http::withBasicAuth($this->secretKey, '')
                ->post($this->baseUrl . '/payment_intents', $payload);

            if (!$response->successful()) {
                throw new \Exception('PayMongo API error: ' . $response->body());
            }

            $result = $response->json();
            
            Log::info('Payment intent created', [
                'intent_id' => $result['data']['id'],
                'amount' => $data['amount_cents']
            ]);

            return [
                'success' => true,
                'data' => $result['data']
            ];

        } catch (\Exception $e) {
            Log::error('Payment intent creation failed', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Retrieve a payment intent
     */
    public function getPaymentIntent(string $intentId): array
    {
        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->get($this->baseUrl . '/payment_intents/' . $intentId);

            if (!$response->successful()) {
                throw new \Exception('PayMongo API error: ' . $response->body());
            }

            return [
                'success' => true,
                'data' => $response->json()['data']
            ];

        } catch (\Exception $e) {
            Log::error('Payment intent retrieval failed', [
                'error' => $e->getMessage(),
                'intent_id' => $intentId
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Attach payment method to intent
     */
    public function attachPaymentMethod(string $intentId, string $paymentMethodId): array
    {
        try {
            $payload = [
                'data' => [
                    'attributes' => [
                        'payment_method' => $paymentMethodId
                    ]
                ]
            ];

            $response = Http::withBasicAuth($this->secretKey, '')
                ->post($this->baseUrl . '/payment_intents/' . $intentId . '/attach', $payload);

            if (!$response->successful()) {
                throw new \Exception('PayMongo API error: ' . $response->body());
            }

            return [
                'success' => true,
                'data' => $response->json()['data']
            ];

        } catch (\Exception $e) {
            Log::error('Payment method attachment failed', [
                'error' => $e->getMessage(),
                'intent_id' => $intentId,
                'payment_method_id' => $paymentMethodId
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Verify webhook signature
     */
    public function verifyWebhookSignature(string $payload, string $signature, string $secret): bool
    {
        $expectedSignature = 'sha256=' . hash_hmac('sha256', $payload, $secret);
        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Get payment intent status
     */
    public function getPaymentIntentStatus(string $intentId): ?string
    {
        $result = $this->getPaymentIntent($intentId);
        
        if (!$result['success']) {
            return null;
        }

        return $result['data']['attributes']['status'] ?? null;
    }

    /**
     * Check if payment is successful
     */
    public function isPaymentSuccessful(string $intentId): bool
    {
        $status = $this->getPaymentIntentStatus($intentId);
        return $status === 'succeeded';
    }

    /**
     * Get payment details
     */
    public function getPaymentDetails(string $intentId): array
    {
        $result = $this->getPaymentIntent($intentId);
        
        if (!$result['success']) {
            return [
                'success' => false,
                'error' => $result['error']
            ];
        }

        $data = $result['data'];
        $attributes = $data['attributes'];

        return [
            'success' => true,
            'id' => $data['id'],
            'status' => $attributes['status'],
            'amount' => $attributes['amount'],
            'currency' => $attributes['currency'],
            'payment_method' => $attributes['payment_method'] ?? null,
            'metadata' => $attributes['metadata'] ?? [],
            'created_at' => $attributes['created_at'],
            'updated_at' => $attributes['updated_at']
        ];
    }
}