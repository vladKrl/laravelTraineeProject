<?php

namespace Tests\Feature\Conversation;

use App\Enums\ProductStatus;
use App\Models\Conversation;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MessageTest extends TestCase
{
    use RefreshDatabase;

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
