<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\Middleware;

class ConversationController extends Controller
{
    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
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
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'body' => 'required|string|max:2000',
        ]);

        $product = Product::findOrFail($request->product_id);

        $buyerId = auth()->id();

        $conversation = Conversation::firstOrCreate([
            'product_id' => $product->id,
            'buyer_id' => $buyerId,
            'seller_id' => $product->user_id,
        ]);

        $message = $conversation->messages()->create([
            'user_id' => $buyerId,
            'body' => $request->body,
        ]);

        $conversation->update(['last_message_at' => now()]);

        $conversation->load(['product.images', 'buyer', 'seller', 'latestMessage']);

        return new ConversationResource($conversation);
    }

    public function show(Conversation $conversation): ConversationResource
    {
        if (auth()->id() !== $conversation->buyer_id && auth()->id() !== $conversation->seller_id) {
            abort(403);
        }

        return new ConversationResource($conversation->load(['messages', 'product', 'buyer', 'seller']));
    }
}
