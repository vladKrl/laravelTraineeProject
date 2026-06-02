<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\ToggleArchiveRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Requests\Product\UploadProductImagesRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\Product\ProductArchiveService;
use App\Services\Product\ProductImageService;
use App\Services\Product\ProductQueryService;
use App\Services\Product\ProductService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ProductController extends Controller implements HasMiddleware
{
    use AuthorizesRequests;

    protected ProductService $productService;
    protected ProductImageService $productImageService;
    protected ProductArchiveService $productArchiveService;
    protected ProductQueryService $productQueryService;

    public function __construct(
        ProductService $productService,
        ProductImageService $productImageService,
        ProductArchiveService $productArchiveService,
        ProductQueryService $productQueryService,
    )
    {
        $this->productService = $productService;
        $this->productImageService = $productImageService;
        $this->productArchiveService = $productArchiveService;
        $this->productQueryService = $productQueryService;
    }

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum', except: ['index', 'show']),
        ];
    }

    public function index(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $products = $this->productQueryService
            ->indexProducts(
                $request->all(),
                $request->user('sanctum'),
            );

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request): ProductResource
    {
        $product = $this->productService
            ->createProduct(
                $request->validated(),
                $request->user(),
            );

        return new ProductResource($product->load(['categories', 'images']));
    }

    public function show(Product $product): ProductResource
    {
        $this->authorize('view', $product);

        $product = $this->productQueryService
            ->showProduct(
                $product,
                auth('sanctum')->user(),
            );

        return new ProductResource($product);
    }

    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $this->authorize('update', $product);

        $this->productService
            ->updateProduct(
                $request->validated(),
                $product,
            );

        return new ProductResource($product->load(['categories', 'images']));
    }

    public function destroy(Product $product): \Illuminate\Http\Response
    {
        $this->authorize('delete', $product);

        $this->productService->deleteProduct($product);

        return response()->noContent();
    }

    public function getPurchases(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $products = $this->productQueryService
            ->getUserPurchases(
                $request->user('sanctum')
            );

        return ProductResource::collection($products);
    }

    public function getDrafts(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $products = $this->productQueryService
            ->getUserDrafts(
                $request->user('sanctum')
            );

        return ProductResource::collection($products);
    }

    public function getArchived(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $products = $this->productQueryService
            ->getUserArchived(
                $request->user('sanctum'),
            );

        return ProductResource::collection($products);
    }

    public function toggleArchive(ToggleArchiveRequest $request, Product $product): ProductResource
    {
        $this->authorize('update', $product);

        $product = $this->productArchiveService
            ->toggleArchive(
                $request->validated(),
                $product
            );

        return new ProductResource($product);
    }

    public function uploadImages(UploadProductImagesRequest $request, Product $product): \Illuminate\Http\JsonResponse
    {
        $this->authorize('update', $product);

        $data = $request->validated();

        $images = $data['images'];
        unset($data['images']);

        $productImages = $this->productImageService->uploadImages($images, $product);

        return response()->json([
            'data' => $productImages,
        ]);
    }

    public function deleteImage(Product $product, ProductImage $image): \Illuminate\Http\Response
    {
        $this->authorize('update', $product);

        $this->productImageService->deleteImage($product, $image);

        return response()->noContent();
    }
}
