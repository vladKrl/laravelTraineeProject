<?php

namespace App\Http\Requests\Product;

use App\Models\Product;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
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
        return [
            'label'       => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string|min:10|max:10000',
            'price'       => 'sometimes|required|numeric|min:0',
            'categories'  => 'nullable|array',
            'categories.*'=> 'exists:categories,id',
            'images' => 'nullable|array|max:9',
            'images.*' => [
                File::image()
                    ->types(['jpg', 'jpeg', 'png', 'webp'])
                    ->max(4096),
            ],
        ];
    }
}
