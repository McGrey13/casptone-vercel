<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactFormMail;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    /**
     * Handle contact form submission
     */
    public function submit(Request $request)
    {
        try {
            // Validate the request
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'subject' => 'required|string|max:255',
                'message' => 'required|string|max:5000',
            ]);

            // Validate minimum word count (10 words)
            $wordCount = str_word_count($validated['message']);
            if ($wordCount < 10) {
                return response()->json([
                    'success' => false,
                    'message' => 'Message must contain at least 10 words. Current word count: ' . $wordCount,
                    'errors' => [
                        'message' => ['The message must contain at least 10 words.']
                    ],
                ], 422);
            }

            // Prepare contact data
            $contactData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'subject' => $validated['subject'],
                'message' => $validated['message'],
                'submitted_at' => now()->format('F d, Y h:i A'),
            ];

            // Send email to CraftConnect
            Mail::to('craftconnect49@gmail.com')
                ->send(new ContactFormMail($contactData));

            return response()->json([
                'success' => true,
                'message' => 'Your message has been sent successfully! We will get back to you soon.',
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error. Please check your input.',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            Log::error('Contact form submission error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while sending your message. Please try again later.',
            ], 500);
        }
    }
}

