<?php

namespace App\Http\Requests\Product;

use App\Enums\ProductStatus;
use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Product::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isDraft = $this->input('status') === ProductStatus::DRAFT->value;

        return [
            'label'       => 'required|string|max:255',
            'description' => $isDraft ? 'nullable|string' : 'required|string|min:10|max:10000',
            'price'       => $isDraft ? 'nullable|numeric' : 'required|numeric|min:0',
            'status' => ['required', Rule::enum(ProductStatus::class)],
            'categories'  => 'nullable|array',
            'categories.*'=> 'exists:categories,id',
            'images' => 'nullable|array|max:9',
            'images.*' => [
                File::image()
                    ->types(['jpg', 'jpeg', 'png', 'webp'])
                    ->max(4096),
            ],
            'region_id' => $isDraft ? 'nullable|exists:locations,id,parent_id,NULL' : 'required|exists:locations,id,parent_id,NULL',
            'city_id' => 'nullable|exists:locations,id',
        ];
    }
}
