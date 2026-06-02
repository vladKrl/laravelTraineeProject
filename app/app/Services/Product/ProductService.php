<?php

namespace App\Services\Product;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ProductService
{
    private ProductImageService $productImageService;

    public function __construct(ProductImageService $productImageService)
    {
        $this->productImageService = $productImageService;
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

            if (!empty($categories)) {
                $product->categories()->sync($categories);
            }

            if (!empty($images)) {
                $this->productImageService->uploadImages($images, $product);
            }

            return $product;
        });
    }

    public function updateProduct(array $data, Product $product): Product
    {
        return DB::transaction(function () use ($data, $product) {
            $hasCategories = array_key_exists('categories', $data);
            $categories = $data['categories'] ?? [];
            unset($data['categories']);

            $product->update($data);

            if ($hasCategories) {
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

    public function clearCache(int $productId): void
    {
        Cache::forget("product-show-{$productId}");
    }
}
