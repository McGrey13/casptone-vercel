<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Events\MessageSent;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    /**
     * Automatically create a conversation when a customer places an order
     * This ensures sellers can immediately communicate with customers who ordered their products
     */
    public static function createConversationForOrder($order)
    {
        try {
            // Get the customer (sender)
            $customer = $order->customer;
            if (!$customer || !$customer->user_id) {
                \Log::warning('Cannot create conversation: customer not found', ['order_id' => $order->orderID]);
                return null;
            }

            // Get the seller (receiver) using sellerID
            if (!$order->sellerID) {
                \Log::warning('Cannot create conversation: order has no sellerID', ['order_id' => $order->orderID]);
                return null;
            }

            $seller = \App\Models\Seller::find($order->sellerID);
            if (!$seller || !$seller->user_id) {
                \Log::warning('Cannot create conversation: seller not found', [
                    'order_id' => $order->orderID,
                    'seller_id' => $order->sellerID
                ]);
                return null;
            }

            // Check if conversation already exists
            $existingConversation = Conversation::where('sender_id', $customer->user_id)
                ->where('recever_id', $seller->user_id)
                ->first();

            if ($existingConversation) {
                // Update the conversation to link it to the order if not already linked
                if (!$existingConversation->orderID) {
                    $existingConversation->update(['orderID' => $order->orderID]);
                }
                \Log::info('Conversation already exists for order', [
                    'conversation_id' => $existingConversation->conversation_id,
                    'order_id' => $order->orderID
                ]);
                return $existingConversation;
            }

            // Create new conversation linked to the order
            $conversation = Conversation::create([
                'sender_id' => $customer->user_id,
                'recever_id' => $seller->user_id,
                'orderID' => $order->orderID,
            ]);

            \Log::info('Created conversation for order', [
                'conversation_id' => $conversation->conversation_id,
                'order_id' => $order->orderID,
                'customer_id' => $customer->user_id,
                'seller_id' => $seller->user_id
            ]);

            return $conversation;

        } catch (\Exception $e) {
            \Log::error('Error creating conversation for order', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'order_id' => $order->orderID ?? null
            ]);
            // Don't throw exception - we don't want to break order creation if conversation creation fails
            return null;
        }
    }

    public function createConversation(Request $request)
    {
        $request->validate([
            'seller_id' => 'required|exists:sellers,sellerID',
            'initial_message' => 'nullable|string'
        ]);

        try {
            // Try to get authenticated user, but don't require it for now
            $user = auth('sanctum')->user() ?? auth()->user();
            
            if (!$user) {
                \Log::error('User not authenticated in createConversation');
                return response()->json(['error' => 'User not authenticated. Please log in to send messages.'], 401);
            }
            
            $seller = \App\Models\Seller::find($request->seller_id);
            
            if (!$seller) {
                \Log::error('Seller not found in createConversation', ['seller_id' => $request->seller_id]);
                return response()->json(['error' => 'Seller not found'], 404);
            }
            
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
            \Log::error('Error in createConversation', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return response()->json(['error' => 'Failed to create conversation.'], 500);
        }
    }

    public function getConversationWithSeller($sellerId)
    {
        try {
            // Try to get authenticated user, but don't require it for now
            $user = auth('sanctum')->user() ?? auth()->user();
            
            if (!$user) {
                \Log::error('User not authenticated in getConversationWithSeller');
                return response()->json(['error' => 'User not authenticated. Please log in to view messages.'], 401);
            }
            
            $seller = \App\Models\Seller::find($sellerId);
            
            if (!$seller) {
                \Log::error('Seller not found', ['sellerId' => $sellerId]);
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
            \Log::error('Error in getConversationWithSeller', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'sellerId' => $sellerId
            ]);
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

        try {
            // Get authenticated user
            $user = auth('sanctum')->user() ?? auth()->user();
            
            if (!$user) {
                \Log::error('User not authenticated in sendMessage');
                return response()->json(['error' => 'User not authenticated. Please log in to send messages.'], 401);
            }

            DB::beginTransaction();

            // Ensure message_text is not empty (use empty string if null or empty)
            $messageText = $request->message_text ?? '';
            
            \Log::info('Sending message', [
                'conversation_id' => $conversationId,
                'sender_id' => $user->userID,
                'receiver_id' => $request->receiver_id,
                'message_text' => $messageText
            ]);

            $message = Message::create([
                'conversation_id' => $conversationId,
                'sender_id' => $user->userID,
                'receiver_id' => $request->receiver_id,
                'message' => $messageText,
                'message_type' => $request->message_type ?? 'general',
            ]);

            // Handle attachments if present
            if ($request->has('attachments') && is_array($request->attachments)) {
                foreach ($request->attachments as $attachment) {
                    if (isset($attachment['file_url']) && isset($attachment['file_type'])) {
                        \App\Models\MessageAttachment::create([
                            'message_id' => $message->message_id,
                            'messageAttachment' => $attachment['file_url'],
                            'file_type' => $attachment['file_type'],
                        ]);
                    }
                }
            }

            DB::commit();

            // Load the message with attachments
            $message->load('attachments');

            // Notify receiver about new message (if receiver is different from sender)
            if ($request->receiver_id != $user->userID) {
                $conversation = Conversation::find($conversationId);
                if ($conversation) {
                    $senderName = $user->userName ?? 'Someone';
                    NotificationService::notifyNewMessage($conversation, $request->receiver_id, $senderName);
                }
            }

            \Log::info('Message created successfully', ['message_id' => $message->message_id]);

            return response()->json($message);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error sending message', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'conversation_id' => $conversationId,
                'request' => $request->all()
            ]);
            return response()->json(['error' => 'Message failed to send.'], 500);
        }
    }

    public function getMessages($conversationId)
    {
        try {
            \Log::info('Getting messages for conversation', ['conversation_id' => $conversationId]);
            
            $messages = Message::where('conversation_id', $conversationId)
                              ->with('attachments')
                              ->orderBy('created_at', 'asc')
                              ->get();
            
            \Log::info('Messages retrieved', ['count' => $messages->count()]);
            
            return response()->json($messages);
        } catch (\Exception $e) {
            \Log::error('Error getting messages', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'conversation_id' => $conversationId
            ]);
            return response()->json(['error' => 'Failed to get messages.'], 500);
        }
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

    public function getCustomerConversations(Request $request)
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            \Log::info('Fetching conversations for customer', [
                'user_id' => $user->userID
            ]);

            // Get all conversations where the customer is the sender
            $conversations = Conversation::where('sender_id', $user->userID)
                ->with(['receiver.seller', 'messages' => function($query) {
                    $query->orderBy('created_at', 'desc')->limit(1);
                }])
                ->orderBy('updated_at', 'desc')
                ->get()
                ->map(function($conversation) {
                    $receiverUser = $conversation->receiver;
                    return [
                        'conversation_id' => $conversation->conversation_id,
                        'seller' => [
                            'userName' => $receiverUser->userName ?? 'Seller',
                            'userEmail' => $receiverUser->userEmail ?? '',
                        ],
                        'receiver' => [
                            'userName' => $receiverUser->userName ?? 'Seller',
                            'userEmail' => $receiverUser->userEmail ?? '',
                        ],
                        'messages' => $conversation->messages,
                        'created_at' => $conversation->created_at,
                        'updated_at' => $conversation->updated_at,
                    ];
                });

            \Log::info('Found conversations for customer', ['count' => $conversations->count()]);

            return response()->json($conversations);

        } catch (\Exception $e) {
            \Log::error('Error fetching customer conversations', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to fetch conversations'], 500);
        }
    }
}
