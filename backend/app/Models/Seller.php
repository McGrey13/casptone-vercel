<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Order;
use App\Models\User;
use App\Models\Store;


class Seller extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     */
    protected $primaryKey = 'sellerID';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'businessName',
        'story',
        'website',
        'profile_picture_path',
        'background_picture_path',
        'promotional_video_path',
        'is_verified',
    ];

    /**
     * Get the user that owns the seller profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'userID');
    }

    /**
     * Get the full URL for the profile picture
     */
    public function getProfileImageUrlAttribute()
    {
        if (!$this->profile_picture_path) {
            return null;
        }
        
        if (str_starts_with($this->profile_picture_path, 'http')) {
            return $this->profile_picture_path;
        }
        
        return url('storage/' . ltrim($this->profile_picture_path, '/'));
    }

    /**
     * Get the full URL for the background picture
     */
    public function getBackgroundImageUrlAttribute()
    {
        if (!$this->background_picture_path) {
            return null;
        }
        
        if (str_starts_with($this->background_picture_path, 'http')) {
            return $this->background_picture_path;
        }
        
        return url('storage/' . ltrim($this->background_picture_path, '/'));
    }

    /**
     * Get the full URL for the promotional video
     */
    public function getPromotionalVideoUrlAttribute()
    {
        if (!$this->promotional_video_path) {
            return null;
        }
        
        if (str_starts_with($this->promotional_video_path, 'http')) {
            return $this->promotional_video_path;
        }
        
        return url('storage/' . ltrim($this->promotional_video_path, '/'));
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'seller_id', 'sellerID');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function followers()
    {
        return $this->belongsToMany(User::class, 'seller_follows', 'sellerID', 'userID')->withTimestamps();
    }

    public function store()
    {
        return $this->hasOne(Store::class, 'seller_id', 'sellerID');
    }

    public function balance()
    {
        return $this->hasOne(SellerBalance::class, 'seller_id', 'sellerID');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'seller_id', 'sellerID');
    }


    /**
     * Get all orders for this seller's products
     */
    public function getSellerOrders()
    {
        return Order::whereHas('products', function($query) {
            $query->where('seller_id', $this->sellerID);
        })->with(['products' => function($query) {
            $query->where('seller_id', $this->sellerID);
        }])->get();
    }

    /**
     * Get the total revenue for this seller
     */
    public function getTotalRevenueAttribute()
    {
        $orders = $this->getSellerOrders();
        return $orders->sum(function($order) {
            return $order->products->sum(function($product) {
                return $product->pivot->quantity * $product->pivot->price;
            });
        });
    }

    /**
     * Get the total number of orders for this seller's products
     */
    public function getTotalOrdersAttribute()
    {
        return $this->getSellerOrders()->count();
    }

    /**
     * Get the last sale date for this seller
     */
    public function getLastSaleAttribute()
    {
        $lastOrder = $this->getSellerOrders()->sortByDesc('created_at')->first();
        return $lastOrder ? $lastOrder->created_at : null;
    }

    /**
     * Get the seller's performance status
     */
    public function getPerformanceStatusAttribute()
    {
        $orderCount = $this->getTotalOrdersAttribute();
        $lastSale = $this->getLastSaleAttribute();
        
        if ($orderCount === 0) {
            return 'inactive';
        } elseif ($lastSale && $lastSale->diffInDays(now()) <= 30) {
            return 'active';
        } elseif ($lastSale && $lastSale->diffInDays(now()) <= 90) {
            return 'inactive';
        } else {
            return 'dormant';
        }
    }

}

