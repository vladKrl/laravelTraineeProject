<?php

namespace App\Services\Product;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use JeroenG\Explorer\Domain\Syntax\Nested;
use JeroenG\Explorer\Domain\Syntax\Terms;

class ProductQueryService
{
    public function indexProducts(array $data, ?User $user = null): \Illuminate\Contracts\Pagination\Paginator
    {
        $search = $data['search'] ?? null;
        $categoryIds = $data['category'] ?? null;

        if (!$search && !$categoryIds) {
            return Product::with(['categories', 'mainImage'])
                ->where('status', ProductStatus::ACTIVE->value)
                ->when($user, function ($query) use ($user) {
                    $query->withExists(['favorites as is_favorite' => function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    }]);
                })
                ->simplePaginate(12);
        }

        $scout = Product::search($search ?? '');

        if ($categoryIds) {
            $idsArray = explode(',', $categoryIds);

            $scout->must(
                new Nested(
                    'categories',
                    new Terms('categories.id', $idsArray),
                )
            );
        }

        return $scout
            ->query(function ($builder) use ($user) {
                $builder->with(['categories', 'mainImage'])
                    ->when($user, function ($query) use ($user) {
                        $query->withExists(['favorites as is_favorite' => function ($q) use ($user) {
                            $q->where('user_id', $user->id);
                        }]);
                    });
            })
            ->where('status', ProductStatus::ACTIVE->value)
            ->simplePaginate (12);
    }

    public function showProduct(Product $product, ?User $user = null): Product
    {
        $relations = ['categories', 'user', 'images', 'mainImage', 'region', 'city', 'buyer'];

        $tags = [
            'products',
            "product:{$product->id}",
            "user:{$product->user_id}",
            "location:{$product->region_id}",
        ];

        if ($product->city_id) {
            $tags[] = "location:{$product->city_id}";
        }

        $categoryIds = $product->categories()->pluck('categories.id');

        foreach ($categoryIds as $categoryId) {
            $tags[] = "category:{$categoryId}";
        }

        $cacheKey = "product-show-{$product->id}";

        $product = Cache::tags($tags)->remember($cacheKey, now()->addHours(8), function () use ($product, $relations) {
            return $product->load($relations);
        });

        if ($user) {
            $userId = $user->id;

            if ($userId === $product->user_id) {
                $product->loadMissing('conversations.buyer');
            } else {
                $product->load(['conversations' => function ($query) use ($userId) {
                    $query->where('buyer_id', $userId);
                }]);
            }

            $product->is_favorite = $user
                ->favoriteProducts()
                ->where('product_id', $product->id)
                ->exists();
        }

        return $product;
    }

    public function getUserPurchases(User $user): \Illuminate\Database\Eloquent\Collection
    {
        return $user->purchases()
            ->with(['categories', 'user', 'images', 'mainImage', 'region', 'city'])
            ->withExists('reviews as has_review')
            ->latest('sold_at')
            ->get();
    }

    public function getUserDrafts(User $user): \Illuminate\Pagination\LengthAwarePaginator
    {
        return Product::with(['categories', 'mainImage'])
            ->where('status', ProductStatus::DRAFT->value)
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(12);
    }

    public function getUserArchived(User $user): \Illuminate\Pagination\LengthAwarePaginator
    {
        return Product::with(['categories', 'mainImage'])
            ->where('status', ProductStatus::ARCHIVED->value)
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(12);
    }
}
