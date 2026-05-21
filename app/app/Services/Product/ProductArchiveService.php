<?php

namespace App\Services\Product;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ProductArchiveService
{
    public function getUserArchived(User $user): \Illuminate\Pagination\LengthAwarePaginator
    {
        return Product::with(['categories', 'user', 'images', 'mainImage', 'region', 'city'])
            ->where('status', ProductStatus::ARCHIVED->value)
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(12);
    }

    public function toggleArchive(array $data, Product $product): Product
    {
        return DB::transaction(function () use ($data, $product) {
            if ($product->status->value === ProductStatus::ARCHIVED->value) {
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
