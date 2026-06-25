<?php

namespace App\Http\Requests\Product;

use App\Enums\ProductStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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

        $regionId = $this->input('region_id', $product->region_id);

        $isStrict = $this->input('status') === ProductStatus::ACTIVE->value ||
            (!$this->has('status') && $product->status === ProductStatus::ACTIVE);

        $staticRules = ['sometimes', 'required'];

        if ($product->status === ProductStatus::ARCHIVED) {
            $staticRules[] = Rule::in(ProductStatus::ARCHIVED->value);
        } else {
            $staticRules[] = Rule::in([
                ProductStatus::ACTIVE->value,
                ProductStatus::DRAFT->value,
            ]);
        }

        return [
            'label'       => 'sometimes|required|string|max:255',
            'description' => $isStrict ? 'required|string|min:10|max:10000' : 'nullable|string',
            'price'       => $isStrict ? 'required|numeric|min:0' : 'nullable|numeric',
            'status'      => $staticRules,
            'categories'  => 'nullable|array',
            'categories.*'=> 'exists:categories,id',
            'region_id' => [
                $isStrict ? 'required' : 'nullable',
                Rule::exists('locations', 'id')->whereNull('parent_id'),
            ],
            'city_id' => [
                'nullable',
                Rule::exists('locations', 'id')->where('parent_id', $regionId),
            ],
        ];
    }
}
