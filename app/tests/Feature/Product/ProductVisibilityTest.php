<?php

namespace Tests\Feature\Product;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductVisibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_view_draft_product()
    {
        $user = User::factory()->create();

        $product = Product::factory()->create([
            'user_id'   => $user->id,
            'status'    => ProductStatus::DRAFT->value,
        ]);

        $response = $this->getJson("/api/products/{$product->id}");

        $response->assertStatus(403);
    }

    public function test_guest_cannot_view_archived_product()
    {
        $user = User::factory()->create();

        $product = Product::factory()->create([
            'user_id'   => $user->id,
            'status'    => ProductStatus::ARCHIVED->value,
        ]);

        $response = $this->getJson("/api/products/{$product->id}");

        $response->assertStatus(403);
    }

    public function test_buyer_can_view_archived_purchased_product()
    {
        $seller = User::factory()->create();

        $buyer = User::factory()->create();

        $product = Product::factory()->create([
            'user_id'           => $seller->id,
            'status'            => ProductStatus::ARCHIVED->value,
            'archive_reason'    => 'sold',
            'buyer_id'          => $buyer->id,
        ]);

        Sanctum::actingAs($buyer);

        $response = $this->getJson("/api/products/{$product->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $product->id);
    }
}
