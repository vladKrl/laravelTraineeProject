<?php

namespace Tests\Feature;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Location;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_products(): void
    {
        Product::factory()->count(3)->create(['status' => ProductStatus::ACTIVE->value]);
        Product::factory()->create(['status' => ProductStatus::DRAFT->value]);

        $response = $this->get('/api/products');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data', )
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'label', 'status']
                ]
            ]);
    }

    public function test_can_get_product()
    {
        $product = Product::factory()->create(['status' => ProductStatus::ACTIVE]);

        $response = $this->getJson("/api/products/{$product->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'user_id',
                    'label',
                    'description',
                    'categories',
                    ]
            ]);
    }

    public function test_can_create_product()
    {
        $user = User::factory()->create();

        $category = Category::factory()->create();

        $region = Location::factory()->create();
        $city = Location::factory()->city($region->id)->create();

        Sanctum::actingAs($user);

        $payload = [
            'label'         => 'Valid product name',
            'price'         => '100',
            'status'        => ProductStatus::ACTIVE->value,
            'description'   => 'Valid description of the test product.',
            'categories'    => [$category->id],
            'region_id' => $region->id,
            'city_id' => $city->id,
        ];

        $response = $this->postJson('/api/products', $payload);

        $response->assertStatus(201);

        $this->assertDatabaseHas('products', [
            'label'     => 'Valid product name',
            'user_id'   => $user->id,
            'status'    => ProductStatus::ACTIVE->value,
        ]);
    }
}
