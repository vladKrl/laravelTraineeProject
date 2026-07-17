<?php

namespace Tests\Feature;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FavoriteTest extends TestCase
{
    use RefreshDatabase;

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
}
