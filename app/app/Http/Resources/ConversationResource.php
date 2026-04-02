<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $interlocutor = auth()->id() === $this->buyer_id ? 'seller' : 'buyer';

        return [
            'id' => $this->id,
            'product' => new ProductResource($this->whenLoaded('product')),
            'interlocutor' => new UserResource($this->whenLoaded($interlocutor)),
            'last_message' => new MessageResource($this->whenLoaded('latestMessage')),
            'messages' => MessageResource::collection($this->whenLoaded('messages')),
            'last_message_at' => $this->last_message_at?->diffForHumans(),
            'updated_at' => $this->updated_at,
        ];
    }
}
