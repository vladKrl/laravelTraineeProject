<?php

namespace App\Http\Requests\Product;

use App\Enums\ProductStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class UpdateProductRequest extends FormRequest
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

        $isStrict = $this->input('status') === ProductStatus::ACTIVE->value ||
            (!$this->has('status') && $product->status === ProductStatus::ACTIVE);

        return [
            'label'       => 'sometimes|required|string|max:255',
            'description' => $isStrict ? 'required|string|min:10|max:10000' : 'nullable|string',
            'price'       => $isStrict ? 'required|numeric|min:0' : 'nullable|numeric',
            'status'      => ['sometimes', 'required', Rule::enum(ProductStatus::class)],
            'categories'  => 'nullable|array',
            'categories.*'=> 'exists:categories,id',
            'images' => 'nullable|array|max:9',
            'images.*' => [
                File::image()
                    ->types(['jpg', 'jpeg', 'png', 'webp'])
                    ->max(4096),
            ],
            'region_id'   => $isStrict ? 'required|exists:locations,id,parent_id,NULL' :
                'nullable|exists:locations,id,parent_id,NULL',
            'city_id' => 'nullable|exists:locations,id',
        ];
    }
}
