<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isOwner = $request->user()?->id === $this->id;

        return [
            'id' => $this->id,
            'email' => $this->when($isOwner, $this->email),
            'email_verified_at' => $this->when($isOwner, $this->email_verified_at),
            'name' => $this->name,
            'products' => ProductResource::collection($this->whenLoaded('products')),
            'profile' => new ProfileResource($this->whenLoaded('profile')),
            'is_online' => $this->isOnline(),
        ];
    }
}
