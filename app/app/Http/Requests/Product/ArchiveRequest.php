<?php

namespace App\Http\Requests\Product;

use App\Enums\ProductStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
use Illuminate\Validation\Rule;

class ArchiveRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('product'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $product = $this->route('product');

        return [
            'archive_reason' => [
                'required',
                'string',
                'in:sold,sold_not_here,deleted'
            ],
            'buyer_id'       => [
                'required_if:archive_reason,sold',
                'prohibited_unless:archive_reason,sold',
                'nullable',
                Rule::exists('conversations', 'buyer_id')
                    ->where('product_id', $product?->id),
            ],
        ];
    }
}
