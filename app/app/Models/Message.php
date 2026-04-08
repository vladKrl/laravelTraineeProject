<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use App\Observers\MessageObserver;

#[ObservedBy(MessageObserver::class)]
class Message extends Model
{
    protected $fillable = ['conversation_id', 'user_id', 'body', 'is_read'];

    public function conversation(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }
}
