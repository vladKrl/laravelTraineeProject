<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use App\Models\Product;
use App\Services\Conversation\ConversationService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;

class ConversationController extends Controller implements HasMiddleware
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

    public function index(): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $user = auth()->user();

        $conversations = Conversation::where('buyer_id', $user->id)
            ->orWhere('seller_id', $user->id)
            ->with(['product.images', 'product.mainImage', 'latestMessage', 'seller.profile', 'buyer.profile'])
            ->orderBy('last_message_at', 'desc')
            ->paginate(20);

        return ConversationResource::collection($conversations);
    }

    public function store(Request $request): ConversationResource
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'body' => 'required|string|max:2000',
        ]);

        $product = Product::findOrFail($request->product_id);

        $this->authorize('create', [Conversation::class, $product]);

        $conversation = $this->conversationService
            ->sendFirstMessage(
                $data,
                $product,
                $request->user('sanctum'),
            );

        return new ConversationResource($conversation);
    }

    public function show(Conversation $conversation): ConversationResource
    {
        $this->authorize('participate', $conversation);

        $conversation->load(['product', 'buyer', 'seller']);

        $paginatedMessages = $conversation->messages()
            ->latest('id')
            ->cursorPaginate(25);

        $reversedMessages = $paginatedMessages->getCollection()->reverse()->values();

        $conversation->setRelation('messages', $reversedMessages);

        return (new ConversationResource($conversation))
            ->additional([
                'meta' => [
                    'next_cursor'   => $paginatedMessages->nextCursor()?->encode(),
                    'has_more'      => $paginatedMessages->hasMorePages(),
                ]
            ]);
    }
}
