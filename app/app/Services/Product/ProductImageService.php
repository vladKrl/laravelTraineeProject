<?php

namespace App\Services\Product;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProductImageService
{
    public function uploadImages(array $data, Product $product): array
    {
        $savedImagesCount = $product->images()->count();
        $newImagesCount = count($data);

        if (($savedImagesCount + $newImagesCount) > 9) {
            throw ValidationException::withMessages([
                'images' => 'The max number of images is 9!',
            ]);
        }

        $uploadedImages = [];

        if (!empty($data)) {
            foreach ($data as $index => $image) {
                $path = $image->store("products/{$product->id}", 'public');

                $createdImage = $product->images()->create([
                    'path' => $path,
                    'is_main' => ($savedImagesCount + $index) === 0,
                    'position' => $savedImagesCount + $index,
                ]);

                $uploadedImages[] = $createdImage;
            }
        }

        $this->clearCache($product->id);

        return $uploadedImages;
    }

    public function deleteImage(Product $product, ProductImage $productImage): void
    {
        DB::transaction(function () use ($product, $productImage) {
            Storage::disk('public')->delete($productImage->getRawOriginal('path'));

            $productImage->delete();

            $this->rearrangeMainImage($product);

            $this->clearCache($product->id);
        });
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

    public function clearCache(int $productId): void
    {
        Cache::forget("product-show-{$productId}");
    }
}
