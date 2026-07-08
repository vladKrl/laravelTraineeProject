<?php

namespace Tests\Feature;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Conversation;
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
        Product::factory()->count(4)->create(['status' => ProductStatus::ACTIVE->value]);

        $response = $this->get('/api/products');

        $response->assertStatus(200)
            ->assertJsonCount(4, 'data', )
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

    public function test_can_owner_edit_product()
    {
        $user = User::factory()->create();

        $region = Location::factory()->create();

        $product = Product::factory()->create([
            'user_id'       => $user->id,
            'label'         => 'Old name',
            'description'   => 'Old description here too, that\'s nice!',
            'price'         => 61,
            'status'        => ProductStatus::ACTIVE->value,
        ]);

        $payload = [
            'label'         => 'New name',
            'description'   => 'New description for new product!',
            'price'         => 10,
            'region_id'     => $region->id,
        ];

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/products/{$product->id}", $payload);

        $response->assertStatus(200);

        $this->assertDatabaseHas('products', [
            'id'            => $product->id,
            'label'         => 'New name',
            'description'   => 'New description for new product!',
            'price'         => 10,
        ]);

        $this->assertDatabaseMissing('products', [
            'id'            => $product->id,
            'label'         => 'Old name',
            'description'   => 'Old description here too!',
            'price'         => 61,
        ]);
    }

    public function test_can_owner_delete_product()
    {
        $user = User::factory()->create();

        $product = Product::factory()->create([
            'user_id'       => $user->id,
            'status'        => ProductStatus::ACTIVE->value,
        ]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/products/{$product->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('products',[
            'id' => $product->id,
        ]);
    }

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

        $response = $this->patchJson("/api/products/{$product->id}/toggleArchive", [
            'archive_reason'    => 'sold_not_here',
            'buyer_id'          => $buyer->id,
        ]);

        $response->assertStatus(422);

        $response->assertJsonValidationErrors(['buyer_id']);
    }

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

        $response = $this->patchJson("/api/products/{$product->id}/toggleArchive", [
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

        $response = $this->patchJson("/api/products/{$product->id}/toggleArchive", [
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

    public function test_non_participant_cannot_send_message()
    {
        $seller = User::factory()->create();

        $buyer = User::factory()->create();

        $nonParticipant = User::factory()->create();

        $product = Product::factory()->create([
            'user_id'   => $seller->id,
            'status'    => ProductStatus::ACTIVE->value,
        ]);

        $conversation = Conversation::factory()->create([
            'product_id'    => $product->id,
            'seller_id'     => $seller->id,
            'buyer_id'      => $buyer->id,
        ]);

        Sanctum::actingAs($nonParticipant);

        $response = $this->postJson("/api/conversations/{$conversation->id}/messages", [
            'body'  => 'Random message from non-participant user.',
        ]);

        $response->assertStatus(403);

        $this->assertDatabaseMissing('messages', [
            'conversation_id'   => $conversation->id,
            'body'              => 'Random message from non-participant user.',
        ]);
    }

    public function test_cannot_send_message_when_product_is_archived()
    {
        $seller = User::factory()->create();

        $buyer = User::factory()->create();

        $product = Product::factory()->create([
            'user_id'   => $seller->id,
            'status'    => ProductStatus::ARCHIVED->value,
            'archive_reason'    => 'sold',
            'buyer_id'          => $buyer->id,
        ]);

        $conversation = Conversation::factory()->create([
            'product_id'    => $product->id,
            'seller_id'     => $seller->id,
            'buyer_id'      => $buyer->id,
        ]);

        Sanctum::actingAs($buyer);

        $response = $this->postJson("/api/conversations/{$conversation->id}/messages", [
            'body'  => 'Random message from user.',
        ]);

        $response->assertStatus(422);

        $this->assertDatabaseMissing('messages', [
            'conversation_id'   => $conversation->id,
            'body'              => 'Random message from user.',
        ]);
    }

    public function test_cannot_send_message_when_product_is_soft_deleted()
    {
        $seller = User::factory()->create();

        $buyer = User::factory()->create();

        $product = Product::factory()->create([
            'user_id'   => $seller->id,
            'status'    => ProductStatus::ACTIVE->value,
            'deleted_at'    => now(),
        ]);

        $conversation = Conversation::factory()->create([
            'product_id'    => $product->id,
            'seller_id'     => $seller->id,
            'buyer_id'      => $buyer->id,
        ]);

        Sanctum::actingAs($buyer);

        $response = $this->postJson("/api/conversations/{$conversation->id}/messages", [
            'body'  => 'Random message from user.',
        ]);

        $response->assertStatus(422);

        $this->assertDatabaseMissing('messages', [
            'conversation_id'   => $conversation->id,
            'body'              => 'Random message from user.',
        ]);
    }

    public function test_favorite_index_does_not_return_inaccessible_archived_products()
    {
        $seller = User::factory()->create();

        $liker = User::factory()->create();

        $productArchived = Product::factory()->create([
            'user_id'       => $seller->id,
            'status'        => ProductStatus::ARCHIVED->value,
        ]);

        $productActive = Product::factory()->create([
            'user_id'       => $seller->id,
            'status'        => ProductStatus::ACTIVE->value,
        ]);

        $liker->favoriteProducts()->attach([
            $productActive->id,
            $productArchived->id,
        ]);

        Sanctum::actingAs($liker);

        $response = $this->getJson("/api/favorites");

        $response->assertStatus(200);

        $response->assertJsonFragment(['id' => $productActive->id]);

        $response->assertJsonMissing(['id' => $productArchived->id]);
    }

    public function test_message_body_over_2000_chars_returns_422()
    {
        $seller = User::factory()->create();

        $buyer = User::factory()->create();

        $product = Product::factory()->create([
            'user_id'   => $seller->id,
            'status'    => ProductStatus::ACTIVE->value,
        ]);

        $conversation = Conversation::factory()->create([
            'product_id'    => $product->id,
            'seller_id'     => $seller->id,
            'buyer_id'      => $buyer->id,
        ]);

        Sanctum::actingAs($seller);

        $response = $this->postJson("/api/conversations/{$conversation->id}/messages", [
            'body'  => str_repeat('Repeat', 350),
        ]);

        $response->assertStatus(422);

        $this->assertDatabaseMissing('messages', [
            'conversation_id'   => $conversation->id,
        ]);
    }
}
