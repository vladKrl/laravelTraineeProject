<?php

namespace Tests\Feature\Conversation;

use App\Enums\ProductStatus;
use App\Models\Conversation;
use App\Models\Message;
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

    public function test_show_returns_messages_with_working_next_cursor()
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

        Message::factory()->count(50)->create([
            'conversation_id'   => $conversation->id,
            'user_id'           => $seller->id,
        ]);

        Sanctum::actingAs($seller);

        $response = $this->getJson("/api/conversations/{$conversation->id}/messages");

        $response->assertStatus(200)
            ->assertJsonCount(25, 'data')
            ->assertJsonStructure([
                'data'  => [
                    '*' => ['id', 'body'],
                ],
                'next_cursor',
                'has_more',
            ]);

        $this->assertTrue($response->json('has_more'));

        $nextCursor = $response->json('next_cursor');

        $this->assertNotNull($nextCursor);

        $secondResponse = $this->getJson("/api/conversations/{$conversation->id}/messages?cursor={$nextCursor}");

        $secondResponse->assertStatus(200)
            ->assertJsonCount(25, 'data');

        $this->assertFalse($secondResponse->json('has_more'));

        $firstPageIds = collect($response->json('data'))->pluck('id');
        $secondPageIds = collect($secondResponse->json('data'))->pluck('id');

        $this->assertEmpty(
            $firstPageIds->intersect($secondPageIds),
            'Messages from different pages must not intersect with each other',
        );
    }
}
