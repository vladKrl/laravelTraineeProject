<?php

namespace Tests\Feature\Product;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ProductCacheTest extends TestCase
{
    use RefreshDatabase;

    public function test_show_product_works_with_tagged_cache(): void
    {
        $product = Product::factory()->create([
            'status'        => ProductStatus::ACTIVE->value,
        ]);

        $category = Category::factory()->create();

        $product->categories()->attach($category);

        $response = $this->getJson("/api/products/{$product->id}");

        $response->assertStatus(200);

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

        $this->assertTrue(
            Cache::tags($tags)->has($cacheKey) && Cache::supportsTags(),
        );
    }
}
