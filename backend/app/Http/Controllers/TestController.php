<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TestController extends Controller
{
    // public function testEmail()
    // {
    //     // Create a test user or use an existing one
    //     $credentials = [
    //         'email' => 'test@example.com',
    //         'userPassword' => 'password',
    //     ];

    //     $user = User::firstOrCreate(
    //         ['email' => $credentials['email']],
    //         [
    //             'userFirstName' => 'Test',
    //             'userLastName' => 'User',
    //             'userType' => 'customer',
    //             'userPassword' => bcrypt($credentials['userPassword']),
    //             'email_verification_code' => strtoupper(Str::random(6)),
    //             'userAge' => 25,
    //             'userBirthDay' => '2000-01-01',
    //             'userContactNumber' => '1234567890',
    //             'userAddress' => 'Test Address',
    //             'email_verified_at' => null,
    //             'user_contact_number_verified_at' => null,
    //             'sms_verification_code' => null,
    //             'sms_code_expires_at' => null,
    //         ]
    //     );

    //     // Send the verification email
    //     $user->notify(new VerifyEmailNotification($user->email_verification_code));

    //     return response()->json([
    //         'status' => 'success',
    //         'message' => 'Test email sent to ' . $user->email,
    //         'verification_code' => $user->email_verification_code,
    //     ]);
    // }
}
