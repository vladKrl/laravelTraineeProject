<?php

namespace App\Http\Requests\Product;

use App\Enums\ProductStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
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
                Rule::exists('conversations', 'buyer_id')
                    ->where('product_id', $product?->id),
            ],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $product = $this->route('product');

                $isRestoringFromArchive = $product && $product->status === ProductStatus::ARCHIVED;

                if ($isRestoringFromArchive) {
                    if (empty($product->description) || mb_strlen($product->description) < 10) {
                        $validator->errors()->add('product', 'Cannot put from archive: Description field is too short!');
                    }

                    if (empty($product->region_id)) {
                        $validator->errors()->add('product', 'Cannot put from archive: Region is required!');
                    }

                    if (is_null($product->price) || $product->price < 0) {
                        $validator->errors()->add('product', 'Cannot put from archive: Price field must be valid!');
                    }
                }
            }
        ];
    }
}
