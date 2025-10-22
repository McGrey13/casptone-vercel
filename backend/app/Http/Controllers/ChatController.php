<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    public function createConversation(Request $request)
    {
        $request->validate([
            'seller_id' => 'required|exists:sellers,sellerID',
            'initial_message' => 'nullable|string'
        ]);

        try {
            $user = auth()->user();
            $seller = \App\Models\Seller::find($request->seller_id);
            
            // Check if conversation already exists (using existing schema)
            $existingConversation = Conversation::where('sender_id', $user->userID)
                ->where('recever_id', $seller->user_id)
                ->first();

            if ($existingConversation) {
                $messages = Message::where('conversation_id', $existingConversation->conversation_id)
                    ->orderBy('created_at', 'asc')
                    ->get();

                return response()->json([
                    'conversation_id' => $existingConversation->conversation_id,
                    'messages' => $messages
                ]);
            }

            // Create new conversation (using existing schema)
            $conversation = Conversation::create([
                'sender_id' => $user->userID,
                'recever_id' => $seller->user_id,
            ]);

            $messages = [];
            
            // Send initial message if provided
            if ($request->initial_message) {
                $initialMessage = Message::create([
                    'conversation_id' => $conversation->conversation_id,
                    'sender_id' => $user->userID,
                    'receiver_id' => $seller->user_id,
                    'message' => $request->initial_message,
                    'message_type' => 'general'
                ]);
                
                $messages = [$initialMessage];
            }

            return response()->json([
                'conversation_id' => $conversation->conversation_id,
                'messages' => $messages
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create conversation.'], 500);
        }
    }

    public function getConversationWithSeller($sellerId)
    {
        try {
            $user = auth()->user();
            $seller = \App\Models\Seller::find($sellerId);
            
            if (!$seller) {
                return response()->json(['error' => 'Seller not found'], 404);
            }
            
            $conversation = Conversation::where('sender_id', $user->userID)
                ->where('recever_id', $seller->user_id)
                ->first();

            if (!$conversation) {
                return response()->json(['message' => 'No conversation found'], 404);
            }

            $messages = Message::where('conversation_id', $conversation->conversation_id)
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json([
                'conversation_id' => $conversation->conversation_id,
                'messages' => $messages
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to get conversation.'], 500);
        }
    }

    public function sendMessage(Request $request, $conversationId)
    {
        $request->validate([
            'message_text' => 'nullable|string',
            'message_type' => 'nullable|in:custom_request,order_update,damage_report,after_sale,general',
            'receiver_id' => 'required|exists:users,userID',
        ]);

        DB::beginTransaction();

        try {
            \Log::info('Sending message', [
                'conversation_id' => $conversationId,
                'sender_id' => auth()->user()->userID,
                'receiver_id' => $request->receiver_id,
                'message_text' => $request->message_text
            ]);

            $message = Message::create([
                'conversation_id' => $conversationId,
                'sender_id' => auth()->user()->userID,
                'receiver_id' => $request->receiver_id,
                'message' => $request->message_text,
                'message_type' => $request->message_type ?? 'general',
            ]);

            DB::commit();

            \Log::info('Message created successfully', ['message_id' => $message->message_id]);

            return response()->json($message);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error sending message', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Message failed to send.'], 500);
        }
    }

    public function getMessages($conversationId)
    {
        return Message::where('conversation_id', $conversationId)
                      ->orderBy('created_at', 'asc')
                      ->get();
    }

    public function getSellerConversations(Request $request)
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            // Get seller record for the user
            $seller = \App\Models\Seller::where('user_id', $user->userID)->first();
            
            if (!$seller) {
                return response()->json(['error' => 'User is not a seller'], 403);
            }

            \Log::info('Fetching conversations for seller', [
                'seller_id' => $seller->sellerID,
                'user_id' => $user->userID
            ]);

            $conversations = Conversation::where('recever_id', $seller->user_id)
                ->with(['sender', 'messages' => function($query) {
                    $query->orderBy('created_at', 'desc')->limit(1);
                }])
                ->orderBy('updated_at', 'desc')
                ->get();

            \Log::info('Found conversations', ['count' => $conversations->count()]);

            return response()->json($conversations);

        } catch (\Exception $e) {
            \Log::error('Error fetching seller conversations', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to fetch conversations'], 500);
        }
    }

    public function getConversationWithCustomer(Request $request, $customerId)
    {
        try {
            $seller = auth()->user()->seller;
            
            if (!$seller) {
                return response()->json(['error' => 'User is not a seller'], 403);
            }

            $conversation = Conversation::where('sender_id', $customerId)
                ->where('recever_id', $seller->user_id)
                ->first();

            if (!$conversation) {
                return response()->json(['message' => 'No conversation found'], 404);
            }

            $messages = Message::where('conversation_id', $conversation->conversation_id)
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json([
                'conversation_id' => $conversation->conversation_id,
                'messages' => $messages,
                'customer' => $conversation->sender
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching conversation with customer', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to fetch conversation'], 500);
        }
    }

    public function markMessagesAsRead(Request $request, $conversationId)
    {
        try {
            $seller = auth()->user()->seller;
            
            if (!$seller) {
                return response()->json(['error' => 'User is not a seller'], 403);
            }

            Message::where('conversation_id', $conversationId)
                ->where('receiver_id', $seller->user_id)
                ->update(['is_read' => true]);

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            \Log::error('Error marking messages as read', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to mark messages as read'], 500);
        }
    }
}
