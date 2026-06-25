<?php

namespace App\Http\Resources;

use App\Http\Resources\Product\ProductResource;
use App\Http\Resources\Product\ProductReviewSummaryResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'rating'        => $this->rating,
            'body'          => $this->body,
            'product'       => new ProductReviewSummaryResource($this->whenLoaded('product')),
            'created_at'    => $this->created_at->format('d.m.Y'),
            'author'        => new UserResource($this->whenLoaded('author')),
            'receiver'      => new UserResource($this->whenLoaded('receiver')),
        ];
    }
}
