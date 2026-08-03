<?php

namespace App\Services\Product;

use App\Models\Product;
use App\Models\ProductImage;
use App\Traits\ClearsProductCache;
use App\Traits\DeleteStoredFiles;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProductImageService
{
    use ClearsProductCache, DeleteStoredFiles;

    public function uploadImages(array $data, Product $product): array
    {
        $savedImagesCount = $product->images()->count();
        $newImagesCount = count($data);

        if (($savedImagesCount + $newImagesCount) > 9) {
            throw ValidationException::withMessages([
                'images' => 'The max number of images is 9!',
            ]);
        }

        $storedPaths = [];

        if (empty($data)) {
            return [];
        }

        try {
            foreach ($data as $image) {
                $storedPaths[] = $image->store("products/{$product->id}", 'public');
            }

            $uploadedImages = DB::transaction(function () use ($product, $storedPaths) {
                $lockedProduct = Product::where('id', $product->id)->lockForUpdate()->first();

                $imagesCount = $lockedProduct->images()->count();

                if ($imagesCount + count($storedPaths) > 9) {
                    throw ValidationException::withMessages([
                        'images' => 'The max number of images is 9!',
                    ]);
                }

                $nextPosition = ($lockedProduct->images()->max('position') ?? -1 ) + 1;

                $createdImages = [];

                foreach ($storedPaths as $index => $path) {
                    $createdImages[] = $lockedProduct->images()->create([
                        'path'      => $path,
                        'is_main' => ($imagesCount + $index) === 0,
                        'position' => $nextPosition + $index,
                    ]);
                }

                return $createdImages;
            });
        } catch (\Throwable $e) {
            $this->deleteStoredFiles($storedPaths);

            throw $e;
        }

        $this->clearCache($product->id);

        return $uploadedImages;
    }

    public function deleteImage(Product $product, ProductImage $productImage): void
    {
        $path = $productImage->getRawOriginal('path');

        DB::transaction(function () use ($product, $productImage) {
            $productImage->delete();

            $this->rearrangeMainImage($product);

            $this->clearCache($product->id);
        });

        Storage::disk('public')->delete($path);
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
