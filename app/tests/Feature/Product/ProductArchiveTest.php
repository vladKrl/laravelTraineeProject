<?php

namespace Tests\Feature\Product;

use App\Enums\ProductStatus;
use App\Models\Conversation;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductArchiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_cannot_set_buyer_when_archive_reason_is_sold_not_here()
    {
        $seller = User::factory()->create();

        $buyer = User::factory()->create();

        $product = Product::factory()->create([
            'user_id'       => $seller->id,
            'status'        => ProductStatus::ACTIVE->value,
        ]);

        Conversation::factory()->create([
            'product_id'    => $product->id,
            'seller_id'     => $seller->id,
            'buyer_id'      => $buyer->id,
        ]);

        Sanctum::actingAs($seller);

        $response = $this->patchJson("/api/products/{$product->id}/archive", [
            'archive_reason'    => 'sold_not_here',
            'buyer_id'          => $buyer->id,
        ]);

        $response->assertStatus(422);

        $response->assertJsonValidationErrors(['buyer_id']);
    }

    public function test_seller_can_archive_product_as_sold_with_buyer_from_conversation()
    {
        $seller = User::factory()->create();

        $buyer = User::factory()->create();

        $product = Product::factory()->create([
            'user_id'   => $seller->id,
            'status'    => ProductStatus::ACTIVE->value,
        ]);

        Conversation::factory()->create([
            'product_id'    => $product->id,
            'seller_id'     => $seller->id,
            'buyer_id'      => $buyer->id,
        ]);

        Sanctum::actingAs($seller);

        $response = $this->patchJson("/api/products/{$product->id}/archive", [
            'archive_reason'    => 'sold',
            'buyer_id'          => $buyer->id,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('products', [
            'id'                => $product->id,
            'status'            => ProductStatus::ARCHIVED->value,
            'buyer_id'          => $buyer->id,
            'archive_reason'    => 'sold',
        ]);
    }

    public function test_seller_cannot_archive_product_as_sold_with_random_user()
    {
        $seller = User::factory()->create();

        $randomUser = User::factory()->create();

        $product = Product::factory()->create([
            'user_id'   => $seller->id,
            'status'    => ProductStatus::ACTIVE->value,
        ]);

        Sanctum::actingAs($seller);

        $response = $this->patchJson("/api/products/{$product->id}/archive", [
            'archive_reason'    => 'sold',
            'buyer_id'          => $randomUser->id,
        ]);

        $response->assertStatus(422);

        $this->assertDatabaseHas('products', [
            'id'        => $product->id,
            'status'    => ProductStatus::ACTIVE->value,
            'buyer_id'  => null,
        ]);
    }
}
