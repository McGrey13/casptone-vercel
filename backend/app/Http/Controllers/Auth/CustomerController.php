<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
    /**
     * Get all customers
     */
    public function index()
    {
        try {
            $customers = User::where('role', 'customer')->get();
            
            return response()->json($customers);
        } catch (\Exception $e) {
            Log::error('Error fetching customers:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error fetching customers: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get a specific customer by ID
     */
    public function show($id)
    {
        try {
            Log::info('Fetching customer details', ['customer_id' => $id]);
            
            $user = User::where('userID', $id)->where('role', 'customer')->first();
            
            if (!$user) {
                Log::warning('Customer not found', ['customer_id' => $id]);
                return response()->json(['message' => 'Customer not found'], 404);
            }
            
            Log::info('User found', ['user_id' => $user->userID, 'user_name' => $user->userName]);
            
            // Get customer record for profile picture and orders
            $customer = \App\Models\Customer::where('user_id', $user->userID)->first();
            
            Log::info('Customer record', [
                'found' => $customer ? 'yes' : 'no',
                'customer_id' => $customer ? $customer->customerID : null
            ]);
            
            // Get profile image URL
            $profileImageUrl = null;
            if ($customer && $customer->profile_picture_path) {
                $profileImageUrl = asset('storage/' . $customer->profile_picture_path);
            }
            
            // Calculate orders count and total spent
            $ordersCount = 0;
            $totalSpent = 0;
            $lastPurchaseDate = null;
            
            if ($customer) {
                // Load orders relationship
                $orders = \App\Models\Order::where('customer_id', $customer->customerID)->get();
                $ordersCount = $orders->count();
                
                Log::info('Orders found', [
                    'customer_id' => $customer->customerID,
                    'orders_count' => $ordersCount,
                    'orders_data' => $orders->toArray()
                ]);
                
                // Calculate total spent from ALL orders (not just paid ones)
                // This gives a more accurate picture of customer value
                $totalSpent = $orders->sum('totalAmount');
                
                Log::info('Total spent calculated', [
                    'total_spent' => $totalSpent,
                    'paid_only' => $orders->where('paymentStatus', 'paid')->sum('totalAmount'),
                    'pending' => $orders->where('paymentStatus', 'pending')->sum('totalAmount')
                ]);
                
                // Get last purchase date from any order
                $lastPurchase = $orders->sortByDesc('created_at')->first();
                $lastPurchaseDate = $lastPurchase ? $lastPurchase->created_at : null;
            }
            
            // Determine customer status based on activity
            $status = 'inactive';
            if ($ordersCount > 0) {
                $status = 'active';
                if ($lastPurchaseDate && $lastPurchaseDate->diffInDays(now()) > 90) {
                    $status = 'dormant';
                }
            }
            
            $response = [
                'userID' => $user->userID,
                'userName' => $user->userName,
                'userEmail' => $user->userEmail,
                'userAddress' => $user->userAddress,
                'userContactNumber' => $user->userContactNumber,
                'userBirthday' => $user->userBirthday,
                'userAge' => $user->userAge,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'profile_image_url' => $profileImageUrl,
                'orders_count' => $ordersCount,
                'total_spent' => $totalSpent,
                'last_purchase' => $lastPurchaseDate,
                'status' => $status
            ];
            
            Log::info('Response data', $response);
            
            return response()->json($response);
        } catch (\Exception $e) {
            Log::error('Error fetching customer:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Error fetching customer: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update a customer
     */
    public function update(Request $request, $id)
    {
        try {
            $customer = User::where('userID', $id)->where('role', 'customer')->first();
            
            if (!$customer) {
                return response()->json(['message' => 'Customer not found'], 404);
            }

            $request->validate([
                'userName' => 'nullable|string|max:255',
                'userEmail' => 'nullable|email|unique:users,userEmail,' . $id . ',userID',
                'userContactNumber' => 'nullable|string|max:255',
                'userAddress' => 'nullable|string|max:255',
                'userBirthday' => 'nullable|date',
                'userAge' => 'nullable|integer|min:0',
                'status' => 'nullable|in:active,inactive',
            ]);

            $customer->update($request->only([
                'userName', 'userEmail', 'userContactNumber', 'userAddress', 
                'userBirthday', 'userAge', 'status'
            ]));

            Log::info('Customer updated successfully:', ['customer_id' => $id]);
            
            return response()->json($customer);
        } catch (\Exception $e) {
            Log::error('Error updating customer:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error updating customer: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete a customer
     */
    public function destroy($id)
    {
        try {
            $customer = User::where('userID', $id)->where('role', 'customer')->first();
            
            if (!$customer) {
                return response()->json(['message' => 'Customer not found'], 404);
            }

            $customer->delete();

            Log::info('Customer deleted successfully:', ['customer_id' => $id]);
            
            return response()->json(['message' => 'Customer deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting customer:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error deleting customer: ' . $e->getMessage()], 500);
        }
    }
}
