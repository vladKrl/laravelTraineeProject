<?php

namespace App\Services\Review;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;

class ReviewService
{
    public function createReview(array $data, User $user, Product $product): Review
    {
        $review = Review::create([
            'rating'        => $data['rating'],
            'body'          => $data['body'] ?? null,
            'author_id'     => $user->id,
            'receiver_id'   => $product->user_id,
            'product_id'    => $product->id,
        ]);

        return $review->load(['author', 'product']);
    }
}
