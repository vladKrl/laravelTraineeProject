<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\RestoreRequest;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\ArchiveRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Requests\Product\UploadProductImagesRequest;
use App\Http\Resources\Product\ProductDetailResource;
use App\Http\Resources\Product\ProductResource;
use App\Http\Resources\ProductImageResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\Product\ProductArchiveService;
use App\Services\Product\ProductImageService;
use App\Services\Product\ProductQueryService;
use App\Services\Product\ProductService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
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
            new Middleware('verified',  except: ['index', 'show']),
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

        return new ProductResource($product);
    }

    public function show(Product $product): ProductDetailResource
    {
        $this->authorize('view', $product);

        $product = $this->productQueryService
            ->showProduct(
                $product,
                auth('sanctum')->user(),
            );

        return new ProductDetailResource($product);
    }

    public function update(UpdateProductRequest $request, Product $product): ProductDetailResource
    {
        $this->productService
            ->updateProduct(
                $request->validated(),
                $product,
            );

        return new ProductDetailResource($product);
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

        return ProductDetailResource::collection($products);
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

    public function archive(ArchiveRequest $request, Product $product): ProductDetailResource
    {
        $product = $this->productArchiveService
            ->archive(
                $request->validated(),
                $product
            );

        return new ProductDetailResource($product);
    }

    public function restore(RestoreRequest $request, Product $product): ProductDetailResource
    {
        $product = $this->productArchiveService
            ->restore($product);

        return new ProductDetailResource($product);
    }

    public function uploadImages(UploadProductImagesRequest $request, Product $product): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $data = $request->validated();

        $images = $data['images'];
        unset($data['images']);

        $productImages = $this->productImageService
            ->uploadImages($images, $product);

        return ProductImageResource::collection($productImages);
    }

    public function deleteImage(Product $product, ProductImage $image): \Illuminate\Http\Response
    {
        $this->authorize('update', $product);

        $this->productImageService->deleteImage($product, $image);

        return response()->noContent();
    }
}
