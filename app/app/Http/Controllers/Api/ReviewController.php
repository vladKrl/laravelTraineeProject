<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ReviewController extends Controller implements HasMiddleware
{
    use AuthorizesRequests;

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum', except: ['index']),
        ];
    }

    public function index(User $user): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $reviews = $user->receivedReviews()->with('author')->latest()->paginate(10);

        return ReviewResource::collection($reviews);
    }

    public function store(StoreReviewRequest $request, User $user): ReviewResource
    {
        $this->authorize('create', [Review::class, $user]);

        $review = Review::create([
            'rating'        => $request->rating,
            'body'          => $request->body,
            'author_id'     => auth()->id(),
            'receiver_id'   => $user->id,
            'product_id'    => $request->product_id,
        ]);

        return new ReviewResource($review->load('author'));
    }

    public function destroy(User $user, Review $review): \Illuminate\Http\Response
    {
        $this->authorize('delete', $review);

        $review->delete();

        return response()->noContent();
    }

    public function published(User $user): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $reviews = $user->reviews()->with('receiver')->latest()->paginate(10);

        return ReviewResource::collection($reviews);
    }
}
