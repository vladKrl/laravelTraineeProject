<?php

namespace App\Services\Conversation;

use App\Enums\ProductStatus;
use App\Models\Conversation;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ConversationService
{
    public function sendFirstMessage(array $data, Product $product, User $user): Conversation
    {
        $this->validateProductStatus($product);

        return DB::transaction(function () use ($data, $product, $user) {
            $conversation = Conversation::firstOrCreate([
                'product_id' => $product->id,
                'buyer_id' => $user->id,
                'seller_id' => $product->user_id,
            ]);

            if (!$conversation->wasRecentlyCreated) {
                return $conversation->load(['product', 'buyer', 'seller', 'latestMessage']);
            }

            $conversation->messages()->create([
                'user_id'   => $user->id,
                'body'      => $data['body'],
            ]);

            $conversation->update(['last_message_at' => now()]);

            return $conversation->load(['product', 'buyer', 'seller', 'latestMessage']);
        });
    }

    public function sendMessage(array $data, Conversation $conversation, User $user)
    {
        $this->validateProductStatus($conversation->product);

        return DB::transaction(function () use ($data, $conversation, $user) {
            $message = $conversation->messages()->create([
                'user_id'   => $user->id,
                'body'      => $data['body'],
            ]);

            $conversation->update(['last_message_at' => now()]);

            return $message;
        });
    }

    protected function validateProductStatus(Product $product): void
    {
        if ($product->status !== ProductStatus::ACTIVE) {
            throw ValidationException::withMessages([
                'product_id' => ['You cannot send message. This product already archived or draft.'],
            ]);
        }
    }
}
