<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;

trait ClearsProductCache
{
    public function clearCache(int $productId): void
    {
        Cache::tags(["product:{$productId}"])->flush();
    }
}
