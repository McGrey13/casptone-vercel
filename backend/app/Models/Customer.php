<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Model;
// use App\Models\User;

// class Customer extends Model
// {
//     protected $fillable = [
//         'user_id',
//         'customerEmail',
//         'customerPassword',
//         'customerFirstName',
//         'customerLastName',
//         'customerBirthDay',
//         'customerContactNumber',
//         'customerAddress',
//         'email_verification_code',
//         'email_verified_at',
//         'user_contact_number_verified_at',
//         'sms_verification_code',
//         'sms_code_expires_at',
//     ];

//     protected $hidden = [
//         'customerPassword',
//     ];

//      public function user()
//     {
//         return $this->belongsTo(User::class, 'user_id');
//     }


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Customer extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'customerID';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'profile_picture_path',
    ];

    /**
     * Get the user that owns the customer profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'userID');
    }

    /**
     * Get all orders for this customer.
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'customer_id', 'customerID');
    }

    /**
     * Get the total amount spent by this customer.
     */
    public function getTotalSpentAttribute()
    {
        return $this->orders()->sum('totalAmount');
    }

    /**
     * Get the last purchase date for this customer.
     */
    public function getLastPurchaseAttribute()
    {
        $lastOrder = $this->orders()->latest('created_at')->first();
        return $lastOrder ? $lastOrder->created_at : null;
    }

    /**
     * Get the customer status based on their activity.
     */
    public function getStatusAttribute()
    {
        $orderCount = $this->orders()->count();
        $lastOrder = $this->getLastPurchaseAttribute();
        
        if ($orderCount === 0) {
            return 'inactive';
        } elseif ($lastOrder && $lastOrder->diffInDays(now()) <= 30) {
            return 'active';
        } elseif ($lastOrder && $lastOrder->diffInDays(now()) <= 90) {
            return 'inactive';
        } else {
            return 'dormant';
        }
    }
    
}
