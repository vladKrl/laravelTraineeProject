<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class FavoriteController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
        ];
    }

    public function index(): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $favorites = auth()->user()->favoriteProducts()
            ->with(['images', 'categories', 'mainImage', 'user'])
            ->withExists(['favorites as is_favorite' => function ($q) {
                $q->where('user_id', auth()->id());
            }])
            ->latest('favorites.created_at')
            ->get();

        return ProductResource::collection($favorites);
    }

    public function toggle(Product $product): ProductResource
    {
        $user = auth()->user();

        $toggled = $user->favoriteProducts()->toggle($product->id);

        $product->is_favorite = count($toggled['attached']) > 0;

        $product->load(['images', 'categories', 'mainImage', 'user']);

        return new ProductResource($product);
    }
}
