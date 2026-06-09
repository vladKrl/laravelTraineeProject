<?php

namespace App\Http\Resources;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductDetailResource extends JsonResource
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
            'description' => $this->description,
            'conversations' => ConversationResource::collection($this->whenLoaded('conversations')),
            'buyer' => new UserResource($this->whenLoaded('buyer')),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'can_review' => auth('sanctum')->check()
                ? auth('sanctum')->user()->can('create', [Review::class, $this->resource])
                : false,
            'region' => new LocationResource($this->whenLoaded('region')),
            'city' => new LocationResource($this->whenLoaded('city')),
            'user' => new UserResource($this->whenLoaded('user')),
        ]);
    }
}
