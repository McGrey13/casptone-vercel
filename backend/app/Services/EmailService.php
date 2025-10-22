<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;
use App\Helpers\SslHelper;

class EmailService
{
    /**
     * Send email via Brevo API with proper SSL handling
     */
    public static function sendBrevoEmail($to, $subject, $htmlContent, $textContent = null)
    {
        try {
            $httpClient = Http::withHeaders([
                'accept' => 'application/json',
                'api-key' => env('BREVO_API_KEY'),
                'content-type' => 'application/json'
            ]);

            // Configure SSL options using SslHelper
            $sslOptions = SslHelper::getSslOptions();
            $httpClient = $httpClient->withOptions($sslOptions);

            $emailData = [
                'sender' => [
                    'name' => env('BREVO_SENDER_NAME', 'CraftConnect'),
                    'email' => env('BREVO_SENDER_EMAIL')
                ],
                'to' => $to,
                'subject' => $subject,
                'htmlContent' => $htmlContent,
            ];

            if ($textContent) {
                $emailData['textContent'] = $textContent;
            }

            $response = $httpClient->post('https://api.brevo.com/v3/smtp/email', $emailData);

            if ($response->successful()) {
                Log::info('Email sent successfully via Brevo', [
                    'to' => $to,
                    'subject' => $subject,
                    'message_id' => $response->json('messageId') ?? null
                ]);
                return ['success' => true, 'response' => $response->json()];
            } else {
                Log::error('Failed to send email via Brevo', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'to' => $to,
                    'subject' => $subject
                ]);
                return ['success' => false, 'error' => $response->body()];
            }

        } catch (Exception $e) {
            Log::error('Email sending exception: ' . $e->getMessage(), [
                'to' => $to,
                'subject' => $subject,
                'trace' => $e->getTraceAsString()
            ]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send OTP email specifically
     */
    public static function sendOtpEmail($userEmail, $userName, $otp, $type = 'Verification')
    {
        $to = [['name' => $userName, 'email' => $userEmail]];
        
        // Customize subject and content based on type
        if ($type === 'Password Reset') {
            $subject = 'Password Reset OTP - CraftConnect';
            $htmlContent = "
                <html>
                <body>
                    <h2>Password Reset Request</h2>
                    <p>Hello {$userName},</p>
                    <p>You have requested to reset your password. Your One-Time Password (OTP) is:</p>
                    <h3 style='color: #dc3545; font-size: 24px; font-weight: bold;'>{$otp}</h3>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p><strong>Important:</strong> You will also need to provide your current password to complete the reset.</p>
                    <p>If you didn't request this password reset, please ignore this email and ensure your account is secure.</p>
                    <br>
                    <p>Best regards,<br>The CraftConnect Team</p>
                </body>
                </html>
            ";
            $textContent = "Password Reset Request - Your OTP is: {$otp}. This OTP will expire in 10 minutes. You will also need your current password.";
        } else {
            $subject = 'Your OTP Code - CraftConnect';
            $htmlContent = "
                <html>
                <body>
                    <h2>Welcome to CraftConnect!</h2>
                    <p>Hello {$userName},</p>
                    <p>Your One-Time Password (OTP) for account verification is:</p>
                    <h3 style='color: #007bff; font-size: 24px; font-weight: bold;'>{$otp}</h3>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <br>
                    <p>Best regards,<br>The CraftConnect Team</p>
                </body>
                </html>
            ";
            $textContent = "Welcome to CraftConnect! Your OTP is: {$otp}. This OTP will expire in 10 minutes.";
        }

        return self::sendBrevoEmail($to, $subject, $htmlContent, $textContent);
    }
}
