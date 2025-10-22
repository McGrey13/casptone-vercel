<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Seller;
use App\Models\Review;
use App\Models\Order;

class Product extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'product_id';
    protected $keyType = 'integer';
    public $incrementing = true;

    protected $fillable = [
        'productName',
        'productDescription',
        'productPrice',
        'productQuantity',
        'status',
        'productImage',
        'productImages',
        'productVideo',
        'category',
        'tags',
        'seller_id',
        'approval_status',
        'average_rating',
        'review_count',
        'publish_status',
        'is_featured',
        'sku'
    ];
    
    protected $appends = ['id', 'average_rating', 'review_count'];
    
    protected $casts = [
        'productPrice' => 'decimal:2',
        'average_rating' => 'decimal:2',
        'review_count' => 'integer',
        'is_featured' => 'boolean',
        'productImages' => 'array',
        'tags' => 'array',
    ];

    public function getIdAttribute()
    {
        return $this->product_id;
    }

    public function seller()
    {
        return $this->belongsTo(Seller::class, 'seller_id', 'sellerID');
    }

    /**
     * Get all reviews for the product.
     */
    public function reviews()
    {
        return $this->hasMany(Review::class, 'product_id', 'product_id')
            ->with('user');
    }
    
    /**
     * Get the average rating for the product.
     */
    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?: 0;
    }
    
    /**
     * Get the number of reviews for the product.
     */
    public function getReviewCountAttribute()
    {
        return $this->reviews()->count();
    }

    /**
     * Get the full URL for the product image
     */
    public function getProductImageUrlAttribute()
    {
        if (!$this->productImage) {
            return null;
        }
        
        if (str_starts_with($this->productImage, 'http')) {
            return $this->productImage;
        }
        
        return url('storage/' . ltrim($this->productImage, '/'));
    }

    /**
     * Get the full URL for the product video
     */
    public function getProductVideoUrlAttribute()
    {
        if (!$this->productVideo) {
            return null;
        }
        
        if (str_starts_with($this->productVideo, 'http')) {
            return $this->productVideo;
        }
        
        return url('storage/' . ltrim($this->productVideo, '/'));
    }

    // Automatically set status when quantity changes
    public static function boot()
    {
        parent::boot();

        static::saving(function ($product) {
            if ($product->productQuantity <= 0) {
                $product->status = 'out of stock';
            } elseif ($product->productQuantity <= 5) {
                $product->status = 'low stock';
            } else {
                $product->status = 'in stock';
            }
        });
    }

     public function ratings()
    {
        return $this->hasMany(Ratings::class, 'product_id', 'product_id');
    }

    public function orders()
    {
        return $this->belongsToMany(Order::class, 'order_products', 'product_id', 'order_id')
            ->withPivot(['quantity', 'price'])
            ->withTimestamps();
    }
}


