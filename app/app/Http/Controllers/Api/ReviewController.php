<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Services\Review\ReviewService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ReviewController extends Controller implements HasMiddleware
{
    use AuthorizesRequests;

    private ReviewService $reviewService;

    public function __construct(ReviewService $reviewService)
    {
        $this->reviewService = $reviewService;
    }

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum', except: ['index', 'published']),
            new Middleware('verified', except: ['index', 'published']),
        ];
    }

    public function index(User $user): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $reviews = $user->receivedReviews()->with(['author', 'product', 'product.mainImage'])->latest()->paginate(10);

        return ReviewResource::collection($reviews);
    }

    public function store(StoreReviewRequest $request, Product $product): ReviewResource
    {
        $review = $this->reviewService
            ->createReview(
                $request->validated(),
                $request->user(),
                $product,
            );

        return new ReviewResource($review);
    }

    public function destroy(Review $review): \Illuminate\Http\Response
    {
        $this->authorize('delete', $review);

        $review->delete();

        return response()->noContent();
    }

    public function published(User $user): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $reviews = $user->reviews()->with(['receiver', 'author', 'product'])->latest()->paginate(10);

        return ReviewResource::collection($reviews);
    }
}
