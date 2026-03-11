<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller implements HasMiddleware
{
    use AuthorizesRequests;

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum', except: ['index', 'show']),
        ];
    }

    public function index(): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $products = Product::with('categories')->paginate(12);
        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request): ProductResource
    {
        $data = $request->validated();

        $categories = $data['categories'] ?? [];
        unset($data['categories']);

        $data['user_id'] = Auth::id();

        $product = Product::create($data);

        $product->categories()->sync($categories);

        return new ProductResource($product->load('categories'));
    }

    public function show(Product $product): ProductResource
    {
        $product->load(['categories', 'user']);

        return new ProductResource($product);
    }

    public function update(StoreProductRequest $request, Product $product): ProductResource
    {
        $this->authorize('update', $product);

        $data = $request->validated();

        $product->update($data);

        if ($request->has('categories')) {
            $product->categories()->sync($request->categories);
        }

        return new ProductResource($product->load('categories'));
    }

    public function destroy(Product $product): \Illuminate\Http\Response
    {
        $this->authorize('delete', $product);

        $product->delete();

        return response()->noContent();
    }
}
