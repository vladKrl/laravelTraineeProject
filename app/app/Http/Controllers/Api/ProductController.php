<?php

namespace App\Http\Controllers\Api;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
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
            $products = Product::with(['categories', 'user', 'images', 'mainImage', 'region', 'city'])
                ->where('status', ProductStatus::ACTIVE->value)
                ->cursorPaginate(12);
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
            ->where('status', ProductStatus::ACTIVE->value)
            ->simplePaginate (12);

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request): ProductResource
    {
        $data = $request->validated();

        $categories = $data['categories'] ?? [];
        unset($data['categories']);

        $data['user_id'] = Auth::id();
        $data['status'] ??= ProductStatus::ACTIVE;

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
        $relations = ['categories', 'user', 'images', 'mainImage', 'region', 'city', 'buyer'];

        if (auth('sanctum')->id() === $product->user_id) {
            $relations[] = 'conversations.buyer';
        }

        $cacheKey = "product-show-{$product->id}";

        $productData = Cache::remember($cacheKey, now()->addHours(12), function () use ($product, $relations) {
           return $product->load($relations);
        });

        return new ProductResource($productData);
    }

    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $this->authorize('update', $product);

        $data = $request->validated();

        $product->update($data);

        if ($request->has('categories')) {
            $product->categories()->sync($request->categories);

            $product->touch();
        }

        return new ProductResource($product->load(['categories', 'images']));
    }

    public function destroy(Product $product): \Illuminate\Http\Response
    {
        $this->authorize('delete', $product);

        $product->delete();

        return response()->noContent();
    }

    public function getArchived(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $products = Product::with(['categories', 'user', 'images', 'mainImage', 'region', 'city'])
            ->where('status', ProductStatus::ARCHIVED->value)
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(12);

        return ProductResource::collection($products);
    }

    public function toggleArchive(Request $request, Product $product): ProductResource
    {
        $this->authorize('update', $product);

        if ($product->status->value === ProductStatus::ARCHIVED->value) {
            $product->update([
                'status'            => ProductStatus::ACTIVE->value,
                'buyer_id'          => null,
                'archive_reason'    => null,
                'sold_at'           => null,
            ]);

            return new ProductResource($product->load(['categories', 'user', 'images', 'mainImage', 'region', 'city']));
        }

        $data = $request->validate([
            'archive_reason' => 'required|string|in:sold,sold_not_here,deleted',
            'buyer_id'       => 'required_if:archive_reason,sold|nullable|exists:users,id',
        ]);

        $product->update([
            'status'         => ProductStatus::ARCHIVED->value,
            'archive_reason' => $data['archive_reason'],
            'buyer_id'       => $data['buyer_id'] ?? null,
            'sold_at'        => in_array($data['archive_reason'], ['sold', 'sold_not_here']) ? now() : null,
        ]);

        return new ProductResource($product->load(['categories', 'user', 'images', 'mainImage', 'region', 'city']));
    }

    public function getDrafts(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $products = Product::with(['categories', 'user', 'images', 'mainImage', 'region', 'city'])
            ->where('status', ProductStatus::DRAFT->value)
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(12);

        return ProductResource::collection($products);
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
