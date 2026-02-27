<?php

namespace App\Http\Resources;

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
            'status_id' => $this->status_id,
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
        ];
    }
}
