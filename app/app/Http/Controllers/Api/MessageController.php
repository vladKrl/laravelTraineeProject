<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Services\Conversation\ConversationService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;

class MessageController extends Controller implements HasMiddleware
{
    use AuthorizesRequests;

    protected ConversationService $conversationService;

    public function __construct(ConversationService $conversationService)
    {
        $this->conversationService = $conversationService;
    }

    public static function middleware(): array
    {
        return [
            'auth:sanctum',
            'verified',
        ];
    }

    public function store(Request $request, Conversation $conversation): MessageResource
    {
        $this->authorize('participate', $conversation);

        $data = $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $message = $this->conversationService
            ->sendMessage(
                $data,
                $conversation,
                $request->user('sanctum'),
            );

        return new MessageResource($message);
    }
}
