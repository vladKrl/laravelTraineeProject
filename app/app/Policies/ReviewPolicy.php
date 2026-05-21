<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Review $review): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Product $product): bool
    {
        if ($user->id === $product->user_id) {
            return false;
        }

        $alreadyReviewed = Review::where('product_id', $product->id)
            ->exists();

        $isBuyer = $product->buyer_id === $user->id;

        $hasBought = isset($product->sold_at);

        return !$alreadyReviewed && $hasBought && $isBuyer;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Review $review): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */

    public function delete(User $user, Review $review): bool
    {
        return $user->id === $review->author_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Review $review): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Review $review): bool
    {
        return false;
    }
}
