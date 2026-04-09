<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class MessageController extends Controller implements HasMiddleware
{
    use AuthorizesRequests;

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
        ];
    }

    public function store(Request $request, Conversation $conversation): MessageResource
    {
        $this->authorize('participate', $conversation);

        $request->validate([
            'body' => 'required|string',
        ]);

        $senderId = auth()->id();

        $message = $conversation->messages()->create([
            'user_id' => $senderId,
            'body' => $request->body,
        ]);

        $conversation->update(['last_message_at' => now()]);

        return new MessageResource($message);
    }
}
