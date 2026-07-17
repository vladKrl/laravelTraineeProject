<?php

namespace App\Services\Product;

use App\Enums\ProductStatus;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ProductArchiveService
{
    public function archive(array $data, Product $product)
    {
        return DB::transaction(function () use ($data, $product) {
            $reason = $data['archive_reason'];

            $product->update([
                'status'         => ProductStatus::ARCHIVED->value,
                'archive_reason' => $reason,
                'buyer_id'       => $reason === 'sold' ? ($data['buyer_id'] ?? null) : null,
                'sold_at'        => in_array($reason, ['sold', 'sold_not_here'], true) ? now() : null,
            ]);

            $this->clearCache($product->id);
            return $product->load(['categories', 'user', 'images', 'mainImage', 'region', 'city']);
        });
    }

    public function restore(Product $product): Product
    {
        return DB::transaction(function () use ($product) {
            if ($product->status === ProductStatus::ARCHIVED) {
                $product->update([
                    'status'            => ProductStatus::ACTIVE->value,
                    'buyer_id'          => null,
                    'archive_reason'    => null,
                    'sold_at'           => null,
                ]);
            }

            $this->clearCache($product->id);

            return $product->load(['categories', 'user', 'images', 'mainImage', 'region', 'city']);
        });
    }

    public function clearCache(int $productId): void
    {
        Cache::forget("product-show-{$productId}");
    }
}
