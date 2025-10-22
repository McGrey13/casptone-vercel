<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory;

    protected $table = 'Categories';
    protected $primaryKey = 'id';
    protected $fillable = [
        'CategoryName'
    ];
    
    public $timestamps = false;

    public function products()
    {
        return $this->hasMany(Product::class, 'category', 'CategoryName');
    }
}
