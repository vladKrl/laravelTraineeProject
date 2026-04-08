<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function store(Request $request, Conversation $conversation): MessageResource
    {
        $request->validate([
            'body' => 'required|string',
        ]);

        $buyerId = auth()->id();

        $message = $conversation->messages()->create([
            'user_id' => $buyerId,
            'body' => $request->body,
        ]);

        $conversation->update(['last_message_at' => now()]);

        return new MessageResource($message);
    }
}
