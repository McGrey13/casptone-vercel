<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscountCode extends Model
{
    use HasFactory;

    protected $table = 'coupons';
    protected $primaryKey = 'coupons_id';
    public $timestamps = true;

    protected $fillable = [
        'code',
        'type',
        'value',
        'usage_limit',
        'times_used',
        'expires_at',
        'created_by'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'value' => 'float',
        'usage_limit' => 'integer',
        'times_used' => 'integer',
        'created_by' => 'integer'
    ];

    /**
     * Get the user that created the discount code.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'userID');
    }
    
    /**
     * Scope a query to only include active discount codes.
     */
    public function scopeActive($query)
    {
        return $query->where(function($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        })->where(function($q) {
            $q->whereNull('usage_limit')
              ->orWhereRaw('times_used < usage_limit');
        });
    }
}
