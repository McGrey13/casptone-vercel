<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderProduct extends Model
{
    use HasFactory;

    protected $primaryKey = 'order_product_id';
    
    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price',
        'total_amount',
        'status',
        'notes'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'quantity' => 'integer'
    ];

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id', 'orderID');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id')
            ->with(['seller.user' => function($query) {
                $query->select('userID', 'userName');
            }]);
    }
    
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'userID');
    }
    
    public function getSellerNameAttribute()
    {
        return $this->product && $this->product->seller
            ? $this->product->seller->user->userName
            : 'Unknown Seller';
    }
    
    public function getProductImageAttribute()
    {
        return $this->product ? $this->product->productImage : null;
    }
    
    protected $appends = ['seller_name', 'product_image'];
}
