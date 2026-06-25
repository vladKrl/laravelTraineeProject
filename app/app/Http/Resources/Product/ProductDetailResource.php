<?php

namespace App\Http\Resources\Product;

use App\Http\Resources\ConversationResource;
use App\Http\Resources\LocationResource;
use App\Http\Resources\ProductImageResource;
use App\Http\Resources\UserResource;
use App\Models\Review;
use Illuminate\Http\Request;

class ProductDetailResource extends ProductResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'picture_link' => $this->picture_link,
            'conversations' => ConversationResource::collection($this->whenLoaded('conversations')),
            'buyer' => new UserResource($this->whenLoaded('buyer')),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'can_review' => auth('sanctum')->check()
                && $this->buyer_id === auth('sanctum')->id()
                && $this->sold_at
                && (isset($this->has_review)
                    ? !$this->has_review
                    : auth('sanctum')->user()->can('create', [Review::class, $this->resource])),
            'region' => new LocationResource($this->whenLoaded('region')),
            'city' => new LocationResource($this->whenLoaded('city')),
            'user' => new UserResource($this->whenLoaded('user')),
        ]);
    }
}
