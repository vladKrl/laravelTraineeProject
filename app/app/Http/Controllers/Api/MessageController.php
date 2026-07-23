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

    public function index(Conversation $conversation): \Illuminate\Http\JsonResponse
    {
        $this->authorize('participate', $conversation);

        $paginated = $conversation->messages()
            ->latest('id')
            ->cursorPaginate(25);

        return response()->json([
            'data' => $paginated->getCollection()->reverse()->values(),
            'next_cursor' => $paginated->nextCursor()?->encode(),
            'has_more' => $paginated->hasMorePages(),
        ]);
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
