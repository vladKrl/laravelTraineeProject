<?php

namespace App\Http\Resources\Product;

use App\Http\Resources\ProductImageResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;

class ProductReviewSummaryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $canView = Gate::allows('view', $this->resource);

        return [
            'can_view'      => $canView,
            $this->mergeWhen($canView, [
                'id'            => $this->id,
                'label'         => $this->label,
                'main_image'    => new ProductImageResource($this->whenLoaded('mainImage')),
            ]),
        ];
    }
}
