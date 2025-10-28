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

    /**
     * Send temporary password email
     */
    public static function sendPasswordResetEmail($userEmail, $userName, $tempPassword)
    {
        $to = [['name' => $userName, 'email' => $userEmail]];
        
        $subject = 'Password Reset by Admin - CraftConnect';
        $htmlContent = "
            <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>Hello {$userName},</p>
                <p>Your password has been reset by an administrator. Your new temporary password is:</p>
                <h3 style='color: #dc3545; font-size: 24px; font-weight: bold;'>{$tempPassword}</h3>
                <p><strong>Important:</strong> Please change this password immediately after logging in.</p>
                <p>If you didn't request this password reset, please contact support immediately.</p>
                <br>
                <p>Best regards,<br>The CraftConnect Team</p>
            </body>
            </html>
        ";
        $textContent = "Password Reset Request - Your temporary password is: {$tempPassword}. Please change it after logging in.";

        return self::sendBrevoEmail($to, $subject, $htmlContent, $textContent);
    }

    /**
     * Send password reset link email
     */
    public static function sendPasswordResetLink($userEmail, $userName, $resetUrl)
    {
        $to = [['name' => $userName, 'email' => $userEmail]];
        
        $subject = 'Reset Your Password - CraftConnect';
        $htmlContent = "
            <html>
            <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: #5c3d28;'>Password Reset Request</h2>
                    <p>Hello {$userName},</p>
                    <p>We received a request to reset your password for your CraftConnect account.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='{$resetUrl}' 
                           style='background: linear-gradient(to right, #a4785a, #7b5a3b); 
                                  color: white; 
                                  padding: 14px 28px; 
                                  text-decoration: none; 
                                  border-radius: 6px; 
                                  display: inline-block;
                                  font-weight: bold;'>
                            Reset My Password
                        </a>
                    </div>
                    <p style='color: #666; font-size: 14px;'>
                        Or copy and paste this link into your browser:<br>
                        <a href='{$resetUrl}' style='color: #a4785a; word-break: break-all;'>{$resetUrl}</a>
                    </p>
                    <p style='color: #dc3545; font-size: 14px;'>
                        <strong>Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
                    </p>
                    <hr style='border: none; border-top: 1px solid #ddd; margin: 30px 0;'>
                    <p style='color: #666; font-size: 12px;'>
                        If you're having trouble clicking the button, copy and paste the URL above into your web browser.
                    </p>
                    <p style='color: #666; font-size: 12px;'>Best regards,<br>The CraftConnect Team</p>
                </div>
            </body>
            </html>
        ";
        $textContent = "Password Reset Request - Click this link to reset your password: {$resetUrl}. This link will expire in 1 hour.";

        return self::sendBrevoEmail($to, $subject, $htmlContent, $textContent);
    }
}
