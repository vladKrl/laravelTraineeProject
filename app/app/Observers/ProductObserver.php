<?php

namespace App\Observers;

use App\Models\Product;
use Illuminate\Support\Facades\Cache;

class ProductObserver
{
    public function updated(Product $product): void
    {
        Cache::forget("product-show-{$product->id}");
    }

    public function deleted(Product $product): void
    {
        Cache::forget("product-show-{$product->id}");
    }
}
