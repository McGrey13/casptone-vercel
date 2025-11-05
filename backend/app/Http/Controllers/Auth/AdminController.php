<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use App\Models\Seller;
use App\Models\Customer;
use App\Models\Administrator;
use App\Models\Store;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AdminController extends AuthController
{
    /**
     * Check if the current user is an admin
     */
    private function checkAdminRole()
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'administrator') {
            abort(403, 'Unauthorized: Admin access required.');
        }
    }

    /**
     * Display the administrator dashboard.
     *
     * @return \Illuminate\View\View
     */
    public function dashboard()
    {
        // Example: Fetch some data for the admin dashboard
        $totalUsers = User::count();
        $totalSellers = Seller::count();
        $totalCustomers = Customer::count();

    }

    /**
     * Implement the addNewAdmin() method from UML.
     * This would typically be a form submission to create a new admin user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function addNewAdmin(Request $request)
    {
        $request->validate([
            'userName' => ['required', 'string', 'max:255'],
            'userEmail' => ['required', 'string', 'email', 'max:255', 'unique:users,userEmail'],
            'userPassword' => ['required', 'string', 'min:8'], // No 'confirmed' if admin sets password
        ]);

        $user = User::create([
            'userName' => $request->userName,
            'userEmail' => $request->userEmail,
            'userPassword' => Hash::make($request->userPassword),
            // Other user fields can be added here if needed
        ]);

        $user->administrator()->create([]);

        return redirect()->back()->with('success', 'New administrator added successfully!');
    }

    /**
     * Implement the displayAdmin() method from UML.
     *
     * @param  int  $id
     * @return \Illuminate\View\View
     */
    public function displayAdmin($id)
    {
        $admin = Administrator::with('user')->findOrFail($id);
        return view('admin.show_admin', compact('admin'));
    }

    /**
     * Implement the updateAdministrator() method from UML.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateAdministrator(Request $request, $id)
    {
        $admin = Administrator::findOrFail($id);
        $user = $admin->user; // Get the associated User model

        $request->validate([
            'userName' => ['required', 'string', 'max:255'],
            'userEmail' => ['required', 'string', 'email', 'max:255', 'unique:users,userEmail,' . $user->userID . ',userID'],
            // Add other user fields to validate/update
        ]);

        $user->update([
            'userName' => $request->userName,
            'userEmail' => $request->userEmail,
            // Update other user fields
        ]);

        // If there were specific admin fields, update them here:
        // $admin->update([...]);

        return redirect()->back()->with('success', 'Administrator updated successfully!');
    }

    /**
     * Implement the displayAllCustomer() method from UML.
     *
     * @return \Illuminate\View\View
     */
    public function displayAllCustomers()
    {
        $customers = Customer::with('user')->get();
        return view('admin.customers', compact('customers'));
    }

    /**
     * Implement the displayAllSeller() method from UML.
     *
     * @return \Illuminate\View\View
     */
    public function displayAllSellers()
    {
        $sellers = Seller::with('user')->get();
        return view('admin.sellers', compact('sellers'));
    }

    /**
     * Implement the blockCustomer() method from UML.
     * This is a conceptual example; blocking might involve a 'status' column on the User model.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function blockCustomer($id)
    {
        $customer = Customer::findOrFail($id);
        $user = $customer->user;
        // Example: Add a 'status' column (e.g., 'active', 'blocked') to the users table
        // $user->update(['status' => 'blocked']);
        return redirect()->back()->with('success', 'Customer ' . $user->userName . ' blocked.');
    }

    /**
     * Implement the blockSeller() method from UML.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function blockSeller($id)
    {
        $seller = Seller::findOrFail($id);
        $user = $seller->user;
        // Example: Add a 'status' column (e.g., 'active', 'blocked') to the users table
        // $user->update(['status' => 'blocked']);
        return redirect()->back()->with('success', 'Seller ' . $user->userName . ' blocked.');
    } 

    // verify seller
    public function verifySeller($sellerID)
    {
        $seller = Seller::find($sellerID);
        $seller->is_verified = true;
        $seller->save();
        return response()->json(['message' => 'Seller verified successfully']);
    }

    /**
     * Get all stores for admin verification (optimized)
     */
    public function getAllStores(Request $request)
    {
        $this->checkAdminRole();
        
        $query = Store::with('seller:sellerID,is_verified')
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by store name or owner name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('store_name', 'like', "%{$search}%")
                  ->orWhere('owner_name', 'like', "%{$search}%")
                  ->orWhere('owner_email', 'like', "%{$search}%");
            });
        }

        // Use smaller pagination size for better performance
        $stores = $query->paginate(10);

        // Transform for response
        $stores->getCollection()->transform(function ($store) {
            return [
                'storeID' => $store->storeID,
                'store_name' => $store->store_name,
                'owner_name' => $store->owner_name,
                'owner_email' => $store->owner_email,
                'tin_number' => $store->tin_number,
                'category' => $store->category,
                'status' => $store->status,
                'rejection_reason' => $store->rejection_reason,
                'logo_url' => $store->logo_path ? url('storage/' . $store->logo_path) : null,
                'created_at' => $store->created_at,
                'seller' => $store->seller ? [
                    'sellerID' => $store->seller->sellerID,
                    'is_verified' => $store->seller->is_verified
                ] : null
            ];
        });

        return response()->json($stores);
    }

    /**
     * Get store details for verification
     */
    public function getStoreDetails($storeId)
    {
        $store = Store::with(['seller.user', 'user'])
            ->findOrFail($storeId);

        $store->logo_url = $store->logo_path ? url('storage/' . $store->logo_path) : null;
        $store->bir_url = $store->bir_path ? url('storage/' . $store->bir_path) : null;
        $store->dti_url = $store->dti_path ? url('storage/' . $store->dti_path) : null;
        $store->id_image_url = $store->id_image_path ? url('storage/' . $store->id_image_path) : null;

        return response()->json($store);
    }

    /**
     * Approve store and verify seller
     */
    public function approveStore($storeId)
    {
        $this->checkAdminRole();
        
        $store = Store::findOrFail($storeId);
        
        // Update store status
        $store->update(['status' => 'approved']);
        
        // Verify the seller
        $seller = $store->seller;
        if ($seller) {
            $seller->update(['is_verified' => true]);
            
            // Notify seller about store approval
            if ($seller->user_id) {
                NotificationService::notifyStoreVerification($seller->user_id, true);
            }
        }

        // Clear verification stats cache
        Cache::forget('verification_stats');

        return response()->json([
            'message' => 'Store approved and seller verified successfully',
            'store' => $store
        ]);
    }

    /**
     * Reject store with reason
     */
    public function rejectStore(Request $request, $storeId)
    {
        $this->checkAdminRole();
        
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        $store = Store::findOrFail($storeId);
        
        // Update store status with rejection reason
        $store->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason
        ]);

        // Notify seller about store rejection
        $seller = $store->seller;
        if ($seller && $seller->user_id) {
            NotificationService::notifyStoreVerification($seller->user_id, false, $request->reason);
        }

        // Clear verification stats cache
        Cache::forget('verification_stats');

        return response()->json([
            'message' => 'Store rejected successfully',
            'reason' => $request->reason
        ]);
    }

    /**
     * Get store documents for viewing
     */
    public function getStoreDocuments($storeId)
    {
        $store = Store::findOrFail($storeId);
        
        $documents = [
            'logo' => $store->logo_path ? [
                'path' => $store->logo_path,
                'url' => url('storage/' . $store->logo_path),
                'type' => 'image'
            ] : null,
            'bir_permit' => $store->bir_path ? [
                'path' => $store->bir_path,
                'url' => url('storage/' . $store->bir_path),
                'type' => $this->getFileType($store->bir_path)
            ] : null,
            'dti_permit' => $store->dti_path ? [
                'path' => $store->dti_path,
                'url' => url('storage/' . $store->dti_path),
                'type' => $this->getFileType($store->dti_path)
            ] : null,
            'id_document' => $store->id_image_path ? [
                'path' => $store->id_image_path,
                'url' => url('storage/' . $store->id_image_path),
                'type' => $this->getFileType($store->id_image_path),
                'id_type' => $store->id_type
            ] : null,
        ];

        return response()->json([
            'store_id' => $store->storeID,
            'store_name' => $store->store_name,
            'owner_name' => $store->owner_name,
            'tin_number' => $store->tin_number,
            'documents' => $documents
        ]);
    }

    /**
     * Get comprehensive seller details including their products (optimized)
     */
    public function getSellerDetails($storeId)
    {
        $this->checkAdminRole();
        
        $store = Store::with(['seller.user', 'user'])->findOrFail($storeId);
        $seller = $store->seller;
        
        if (!$seller) {
            return response()->json(['error' => 'Seller not found'], 404);
        }

        // Use DB queries with limits for faster response
        $totalProducts = \App\Models\Product::where('seller_id', $seller->sellerID)->count();
        $totalOrders = \App\Models\Order::whereHas('products', function($query) use ($seller) {
            $query->where('seller_id', $seller->sellerID);
        })->count();
        
        $completedOrders = \App\Models\Order::whereHas('products', function($query) use ($seller) {
            $query->where('seller_id', $seller->sellerID);
        })->where('status', 'delivered')->count();
        
        $totalRevenue = \App\Models\Order::whereHas('products', function($query) use ($seller) {
            $query->where('seller_id', $seller->sellerID);
        })->where('status', 'delivered')->sum('totalAmount');
        
        $completionRate = $totalOrders > 0 ? ($completedOrders / $totalOrders) * 100 : 0;

        return response()->json([
            'seller' => [
                'sellerID' => $seller->sellerID,
                'is_verified' => $seller->is_verified,
                'created_at' => $seller->created_at,
                'user' => [
                    'userID' => $seller->user->userID,
                    'userName' => $seller->user->userName,
                    'userEmail' => $seller->user->userEmail,
                    'userContactNumber' => $seller->user->userContactNumber,
                    'userAddress' => $seller->user->userAddress,
                    'userCity' => $seller->user->userCity,
                    'userProvince' => $seller->user->userProvince,
                    'userRegion' => $seller->user->userRegion,
                    'role' => $seller->user->role,
                    'is_verified' => $seller->user->is_verified,
                    'created_at' => $seller->user->created_at,
                ]
            ],
            'store' => [
                'storeID' => $store->storeID,
                'store_name' => $store->store_name,
                'owner_name' => $store->owner_name,
                'owner_email' => $store->owner_email,
                'tin_number' => $store->tin_number,
                'category' => $store->category,
                'description' => $store->description,
                'status' => $store->status,
                'rejection_reason' => $store->rejection_reason,
                'logo_url' => $store->logo_path ? url('storage/' . $store->logo_path) : null,
                'created_at' => $store->created_at,
                'updated_at' => $store->updated_at,
            ],
            'statistics' => [
                'total_products' => $totalProducts,
                'total_orders' => $totalOrders,
                'completed_orders' => $completedOrders,
                'completion_rate' => round($completionRate, 2),
                'total_revenue' => round($totalRevenue, 2),
                'average_order_value' => $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0,
            ]
        ]);
    }

    /**
     * Get store verification statistics (cached)
     */
    public function getVerificationStats()
    {
        $this->checkAdminRole();
        
        // Cache stats for 2 minutes (120 seconds)
        $stats = Cache::remember('verification_stats', 120, function() {
            return [
                'total_stores' => Store::count(),
                'pending_stores' => Store::where('status', 'pending')->count(),
                'approved_stores' => Store::where('status', 'approved')->count(),
                'rejected_stores' => Store::where('status', 'rejected')->count(),
                'verified_sellers' => Seller::where('is_verified', true)->count(),
                'unverified_sellers' => Seller::where('is_verified', false)->count(),
                'total_customers' => User::where('role', 'customer')->count(),
                'total_artisans' => User::where('role', 'seller')->count(),
            ];
        });

        return response()->json($stats);
    }

    /**
     * Helper method to determine file type
     */
    private function getFileType($filePath)
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        
        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'svg'])) {
            return 'image';
        } elseif (in_array($extension, ['pdf'])) {
            return 'pdf';
        } else {
            return 'file';
        }
    }

    /**
     * Deactivate a customer account
     */
    public function deactivateCustomer($customerId)
    {
        $this->checkAdminRole();
        
        try {
            $user = User::findOrFail($customerId);
            
            if ($user->role !== 'customer') {
                return response()->json(['message' => 'User is not a customer'], 400);
            }
            
            $user->status = 'deactivated';
            $user->save();

            // Notify customer about account deactivation
            NotificationService::notifyAccountAction($user->userID, 'deactivated');
            
            return response()->json([
                'message' => 'Customer account deactivated successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to deactivate customer: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Reactivate a customer account
     */
    public function reactivateCustomer($customerId)
    {
        $this->checkAdminRole();
        
        try {
            $user = User::findOrFail($customerId);
            
            if ($user->role !== 'customer') {
                return response()->json(['message' => 'User is not a customer'], 400);
            }
            
            $user->status = 'active';
            $user->save();

            // Notify customer about account reactivation
            NotificationService::notifyAccountAction($user->userID, 'reactivated');
            
            return response()->json([
                'message' => 'Customer account reactivated successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to reactivate customer: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Deactivate a seller account
     */
    public function deactivateSeller($sellerId)
    {
        $this->checkAdminRole();
        
        try {
            $seller = Seller::with('user')->findOrFail($sellerId);
            $user = $seller->user;
            
            $user->status = 'deactivated';
            $user->save();

            // Notify seller about account deactivation
            NotificationService::notifyAccountAction($user->userID, 'deactivated');
            
            return response()->json([
                'message' => 'Seller account deactivated successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to deactivate seller: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Reactivate a seller account
     */
    public function reactivateSeller($sellerId)
    {
        $this->checkAdminRole();
        
        try {
            $seller = Seller::with('user')->findOrFail($sellerId);
            $user = $seller->user;
            
            $user->status = 'active';
            $user->save();

            // Notify seller about account reactivation
            NotificationService::notifyAccountAction($user->userID, 'reactivated');
            
            return response()->json([
                'message' => 'Seller account reactivated successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to reactivate seller: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Reset password for a customer
     */
    public function resetCustomerPassword($customerId)
    {
        $this->checkAdminRole();
        
        try {
            $user = User::findOrFail($customerId);
            
            if ($user->role !== 'customer') {
                return response()->json(['message' => 'User is not a customer'], 400);
            }
            
            // Generate temporary password
            $tempPassword = \Illuminate\Support\Str::random(12);
            
            $user->userPassword = \Illuminate\Support\Facades\Hash::make($tempPassword);
            $user->save();
            
            // Send email with temporary password
            \App\Services\EmailService::sendPasswordResetEmail($user->userEmail, $user->userName, $tempPassword);
            
            return response()->json([
                'message' => 'Password reset email sent successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to reset password: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Reset password for a seller
     */
    public function resetSellerPassword($sellerId)
    {
        $this->checkAdminRole();
        
        try {
            $seller = Seller::with('user')->findOrFail($sellerId);
            $user = $seller->user;
            
            // Generate temporary password
            $tempPassword = \Illuminate\Support\Str::random(12);
            
            $user->userPassword = \Illuminate\Support\Facades\Hash::make($tempPassword);
            $user->save();
            
            // Send email with temporary password
            \App\Services\EmailService::sendPasswordResetEmail($user->userEmail, $user->userName, $tempPassword);
            
            return response()->json([
                'message' => 'Password reset email sent successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to reset password: ' . $e->getMessage()], 500);
        }
    }
}
