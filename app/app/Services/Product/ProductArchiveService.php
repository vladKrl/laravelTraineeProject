<?php

namespace App\Services\Product;

use App\Enums\ProductStatus;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ProductArchiveService
{
    public function toggleArchive(array $data, Product $product): Product
    {
        return DB::transaction(function () use ($data, $product) {
            if ($product->status === ProductStatus::ARCHIVED) {
                $product->update([
                    'status'            => ProductStatus::ACTIVE->value,
                    'buyer_id'          => null,
                    'archive_reason'    => null,
                    'sold_at'           => null,
                ]);
            } else {
                $product->update([
                    'status'         => ProductStatus::ARCHIVED->value,
                    'archive_reason' => $data['archive_reason'],
                    'buyer_id'       => $data['buyer_id'] ?? null,
                    'sold_at'        => in_array($data['archive_reason'], ['sold', 'sold_not_here']) ? now() : null,
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
