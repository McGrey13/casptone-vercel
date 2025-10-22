<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ratings extends Model
{
        protected $fillable = [
            'product_id',
            'customer_id',
            'stars',
            'comment'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id', 'customerID');
    }
}
