<?php

namespace App\Http\Requests\Product;

use App\Enums\ProductStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ToggleArchiveRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $product = $this->route('product');

        $isArchiving = $product && $product->status !== ProductStatus::ARCHIVED;

        return [
            'archive_reason' => [
                $isArchiving ? 'required' : 'sometimes',
                'string',
                'in:sold,sold_not_here,deleted'
            ],
            'buyer_id'       => [
                'required_if:archive_reason,sold',
                'nullable',
                Rule::exists('conversation', 'buyer_id')
                    ->where('product_id', $product?->id),
            ],
        ];
    }
}
