<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

class UploadProductImagesRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'images' => 'required|array|max:9',
            'images.*' => [
                File::image()
                    ->types(['jpg', 'jpeg', 'png', 'webp'])
                    ->max(4096),
            ],
        ];
    }
}
