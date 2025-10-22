<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $primaryKey = 'conversation_id';
    public $incrementing = true;
    
    protected $fillable = [
        'sender_id', 
        'recever_id',
        'orderID',
        'product_id'
    ];

    public function messages()
    {
        return $this->hasMany(Message::class, 'conversation_id', 'conversation_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id', 'userID');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'recever_id', 'userID');
    }

    public function updateLatestMessage($message)
    {
        $this->update(['updated_at' => $message->created_at]);
    }
}
