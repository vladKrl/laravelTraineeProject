<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    public function index(): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $products = Product::with('categories')->paginate(12);
        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request): ProductResource
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id();

        $product = Product::create($data);

        $product->categories()->sync($request->categories);

        return new ProductResource($product->load('categories'));
    }
}
