<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Store extends Model
{
    use HasFactory;

    protected $primaryKey = 'storeID';
    protected $keyType = 'int';
    public $incrementing = true;

    protected $fillable = [
        'seller_id',
        'user_id',
        'store_name',
        'store_description',
        'category',
        'logo_path',
        'background_image_path',
        'bir_path',
        'dti_path',
        'id_image_path',
        'id_type',
        'tin_number',
        'owner_name',
        'owner_email',
        'owner_phone',
        'owner_address',
        'status',
        'rejection_reason',
        'primary_color',
        'secondary_color',
        'background_color',
        'text_color',
        'accent_color',
        'heading_font',
        'body_font',
        'heading_size',
        'body_size',
        'show_hero_section',
        'show_featured_products',
        'desktop_columns',
        'mobile_columns',
        'product_card_style',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'userID');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class, 'seller_id', 'sellerID');
    }
}