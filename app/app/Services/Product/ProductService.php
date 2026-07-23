<?php

namespace App\Services\Product;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\User;
use App\Traits\ClearsProductCache;
use Illuminate\Support\Facades\DB;

class ProductService
{
    use ClearsProductCache;

    private ProductImageService $productImageService;

    public function __construct(ProductImageService $productImageService)
    {
        $this->productImageService = $productImageService;
    }

    public function createProduct(array $data, User $user): Product
    {
        $hasImages = array_key_exists('images', $data);
        $images = $data['images'] ?? [];

        unset($data['images']);

        $product = DB::transaction(function () use ($data, $user) {
            $hasCategories = array_key_exists('categories', $data);
            $categories = $data['categories'] ?? [];

            unset($data['categories']);

            $data['user_id'] = $user->id;
            $data['status'] ??= ProductStatus::ACTIVE;

            $product = Product::create($data);

            if ($hasCategories) {
                $product->categories()->sync($categories);

                $product->touch();
            }

            return $product;
        });

        if ($hasImages) {
            try {
                $this->productImageService->uploadImages($images, $product);
            } catch (\Throwable $e) {
                $product->delete();

                throw $e;
            }
        }

        return $product->load(['categories', 'mainImage']);
    }

    public function updateProduct(array $data, Product $product): Product
    {
        return DB::transaction(function () use ($data, $product) {
            $hasCategories = array_key_exists('categories', $data);
            $categories = $data['categories'] ?? [];
            unset($data['categories']);

            $regionWasChanged = array_key_exists('region_id', $data)
                && (int) $data['region_id'] !== (int) $product->region_id;

            if ($regionWasChanged && !array_key_exists('city_id', $data)) {
                $data['city_id'] = null;
            }

            $product->update($data);

            if ($hasCategories) {
                $product->categories()->sync($categories);

                $product->touch();
            }

            $this->clearCache($product->id);

            return $product->load(['categories', 'user', 'images', 'mainImage', 'region', 'city']);
        });
    }

    public function deleteProduct(Product $product): void
    {
        $product->delete();

        $this->clearCache($product->id);
    }
}
