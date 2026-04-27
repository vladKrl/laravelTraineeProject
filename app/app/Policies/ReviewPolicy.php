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
    public function create(User $user, User $receiver): bool
    {
        if ($user->id === $receiver->id) {
            return false;
        }

        $alreadyReviewed = Review::where('author_id', $user->id)
            ->where('receiver_id', $receiver->id)
            ->exists();

        $hasBought = Product::where('user_id', $receiver->id)
            ->where('buyer_id', $user->id)
            ->whereNotNull('sold_at')
            ->exists();

        return !$alreadyReviewed && $hasBought;
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
