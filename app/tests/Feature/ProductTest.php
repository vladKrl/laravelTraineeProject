<?php

namespace Tests\Feature;

use App\Enums\ProductStatus;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic feature test example.
     */
    public function test_get_products(): void
    {
        Product::factory()->count(3)->create(['status' => ProductStatus::ACTIVE]);
        Product::factory()->create(['status' => ProductStatus::DRAFT]);

        $response = $this->get('/api/products');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data', )
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'label', 'status']
                ]
            ]);
    }
}
