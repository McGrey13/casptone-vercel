<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Seller;

class Work_and_Events extends Model
{
    use HasFactory;

    protected $table = 'work_and_events';
    protected $primaryKey = 'works_and_events_id';

    protected $fillable = [
        'title',
        'seller_id',
        'description',
        'image',
        'link',
        'location',
        'date',
        'time',
        'participants',
        'status'
    ];

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class, 'seller_id', 'sellerID');
    }

    public function sellerWithUser(): BelongsTo
    {
        return $this->belongsTo(Seller::class, 'seller_id', 'sellerID')->with('user');
    }

    public function getImageUrlAttribute()
    {
        return $this->image ? url('storage/' . ltrim($this->image, '/')) : null;
    }

    public function getLinkUrlAttribute()
    {
        return $this->link ? url('storage/' . ltrim($this->link, '/')) : null;
    }

    public function getLocationUrlAttribute()
    {
        return $this->location ? url('storage/' . ltrim($this->location, '/')) : null;
    }

    public function getFormattedDateAttribute()
    {
        return $this->date ? date('F d, Y', strtotime($this->date)) : null;
    }

    public function getFormattedTimeAttribute()
    {
        return $this->time ? date('h:i A', strtotime($this->time)) : null;
    }

    public function getFormattedCreatedAtAttribute()
    {
        return $this->created_at ? date('F d, Y', strtotime($this->created_at)) : null;
    }

    public function getFormattedUpdatedAtAttribute()
    {
        return $this->updated_at ? date('F d, Y', strtotime($this->updated_at)) : null;
    }
}
