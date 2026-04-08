<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UploadProductImagesRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use JeroenG\Explorer\Domain\Syntax\Terms;
use JeroenG\Explorer\Domain\Syntax\Nested;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller implements HasMiddleware
{
    use AuthorizesRequests;

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum', except: ['index', 'show']),
        ];
    }

    public function index(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $search = $request->input('search');
        $categoryIds = $request->query('category');

        if (!$search && !$categoryIds) {
            $products = Product::with(['categories', 'images', 'mainImage'])->paginate(12);
            return ProductResource::collection($products);
        }

        $scout = Product::search($search ?? '');

        if ($categoryIds) {
            $idsArray = explode(',', $categoryIds);

            $scout->must(
                new Nested(
                    'categories',
                    new Terms('categories.id', $idsArray),
                )
            );
        }

        $products = $scout
            ->query(function ($builder) {
                $builder->with(['categories', 'images', 'mainImage']);
            })
            ->paginate(12);

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

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products', 'public');
                $product->images()->create([
                    'path' => $path,
                    'is_main' => $index === 0,
                    'position' => $index,
                ]);
            }
        }

        return new ProductResource($product->load(['categories', 'images']));
    }

    public function show(Product $product): ProductResource
    {
        $cacheKey = "product-show-{$product->id}";

        $productData = Cache::remember($cacheKey, now()->addHours(12), function () use ($product) {
           return $product->load(['categories', 'user', 'images']);
        });

        return new ProductResource($productData);
    }

    public function update(StoreProductRequest $request, Product $product): ProductResource
    {
        $this->authorize('update', $product);

        $data = $request->validated();

        $product->update($data);

        if ($request->has('categories')) {
            $product->categories()->sync($request->categories);
        }

        return new ProductResource($product->load(['categories', 'images']));
    }

    public function destroy(Product $product): \Illuminate\Http\Response
    {
        $this->authorize('delete', $product);

        $product->delete();

        return response()->noContent();
    }

    public function uploadImages(UploadProductImagesRequest $request, Product $product): \Illuminate\Http\JsonResponse
    {
        $this->authorize('update', $product);

        $savedImagesCount = $product->images()->count();
        $newImagesCount = count($request->file('images'));

        if (($savedImagesCount + $newImagesCount) > 9) {
            return response()->json([
                'message' => 'The max number of images is 9!',
                'errors' => ['images' => ['9 images allowed maximum.']]
            ], 422);
        }

        $productImages = [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $imagePath = $file->store("products/{$product->id}", 'public');

                $image = $product->images()->create([
                    'path' => $imagePath,
                    'is_main' => $product->images()->count() === 0,
                    'position' => count($productImages) + $savedImagesCount,
                ]);

                $productImages[] = $image;
            }
        }

        return response()->json([
            'data' => $productImages,
        ]);
    }

    public function deleteImage(Product $product, ProductImage $image): \Illuminate\Http\Response
    {
        $this->authorize('update', $product);

        Storage::disk('public')->delete($image->getRawOriginal('path'));

        $image->delete();

        $this->rearrangeMainImage($product);

        return response()->noContent();
    }

    protected function rearrangeMainImage(Product $product)
    {
        $images = $product->images()->get();

        if ($images->isEmpty()){
            return null;
        }

        if (!$images->contains('is_main', true)) {
            $product->images()->update(['is_main' => false]);

            $images->first()->update([
                'is_main' => true,
            ]);
        }
    }
}
