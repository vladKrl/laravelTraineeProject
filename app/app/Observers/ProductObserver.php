<?php

namespace App\Observers;

use App\Models\Product;
use App\Traits\ClearsProductCache;

class ProductObserver
{
    use ClearsProductCache;

    public function updated(Product $product): void
    {
        $this->clearCache($product->id);
    }

    public function deleted(Product $product): void
    {
        $this->clearCache($product->id);
    }
}
