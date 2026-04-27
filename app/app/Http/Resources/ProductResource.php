<?php

namespace App\Http\Resources;

use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'label' => $this->label,
            'picture_link' => $this->picture_link,
            'description' => $this->description,
            'price' => isset($this->price) ? (float)$this->price : null,
            'status' => $this->status->value,
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'conversations' => ConversationResource::collection($this->whenLoaded('conversations')),
            'buyer' => new UserResource($this->whenLoaded('buyer')),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'main_image' => new ProductImageResource($this->whenLoaded('mainImage')),
            'created_at' => $this->created_at,
            'is_favorite' => auth()->user()
                ? auth()->user()->favoriteProducts()->where('product_id', $this->id)->exists()
                : false,
            'region' => new LocationResource($this->whenLoaded('region')),
            'city' => new LocationResource($this->whenLoaded('city')),
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
