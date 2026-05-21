<?php

namespace App\Services\Product;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use JeroenG\Explorer\Domain\Syntax\Nested;
use JeroenG\Explorer\Domain\Syntax\Terms;

class ProductService
{
    private ProductImageService $productImageService;

    public function __construct(ProductImageService $productImageService)
    {
        $this->productImageService = $productImageService;
    }

    public function indexProducts(array $data, ?User $user = null): \Illuminate\Contracts\Pagination\Paginator
    {
        $search = $data['search'] ?? null;
        $categoryIds = $data['category'] ?? null;

        if (!$search && !$categoryIds) {
            return Product::with(['categories', 'user', 'images', 'mainImage', 'region', 'city'])
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
                $builder->with(['categories', 'images', 'mainImage'])
                    ->when($user, function ($query) use ($user) {
                        $query->withExists(['favorites as is_favorite' => function ($q) use ($user) {
                            $q->where('user_id', $user->id);
                        }]);
                    });
            })
            ->where('status', ProductStatus::ACTIVE->value)
            ->simplePaginate (12);
    }

    public function createProduct(array $data, User $user): Product
    {
        return DB::transaction(function () use ($data, $user) {
            $categories = $data['categories'] ?? [];

            $images = $data['images'] ?? [];

            unset($data['images'], $data['categories']);

            $data['user_id'] = $user->id;
            $data['status'] ??= ProductStatus::ACTIVE;

            $product = Product::create($data);

            if (isset($categories)) {
                $product->categories()->sync($categories);
            }

            if (!empty($images)) {
                $this->productImageService->uploadImages($images, $product);
            }

            return $product;
        });
    }

    public function showProduct(Product $product, ?User $user = null): Product
    {
        $relations = ['categories', 'user', 'images', 'mainImage', 'region', 'city'];
        $cacheKey = "product-show-{$product->id}";

        $product = Cache::remember($cacheKey, now()->addHours(12), function () use ($product, $relations) {
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

    public function updateProduct(array $data, Product $product): Product
    {
        return DB::transaction(function () use ($data, $product) {
            $categories = $data['categories'] ?? [];
            unset($data['categories']);

            $product->update($data);

            if ($categories) {
                $product->categories()->sync($categories);

                $product->touch();
            }

            $this->clearCache($product->id);

            return $product;
        });
    }

    public function deleteProduct(Product $product): void
    {
        $product->delete();

        $this->clearCache($product->id);
    }

    public function getUserPurchases(User $user): \Illuminate\Database\Eloquent\Collection
    {
        return $user->purchases()
            ->with(['images', 'mainImage'])
            ->latest('sold_at')
            ->get();
    }

    public function getUserDrafts(User $user): \Illuminate\Pagination\LengthAwarePaginator
    {
        return Product::with(['categories', 'user', 'images', 'mainImage', 'region', 'city'])
            ->where('status', ProductStatus::DRAFT->value)
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(12);
    }

    public function clearCache(int $productId): void
    {
        Cache::forget("product-show-{$productId}");
    }
}
