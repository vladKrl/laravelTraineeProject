<?php

namespace Database\Factories;

use App\Enums\ProductStatus;
use App\Models\Location;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'label' => $this->faker->sentence(3),
            'description' => $this->faker->optional()->paragraph(),
            'price' => $this->faker->randomFloat(2, 1, 100),
            'status' => ProductStatus::ACTIVE,
            'created_at' => now(),
            'region_id' => Location::factory(),
            'city_id' => function (array $attributes) {
                return Location::factory()->city($attributes['region_id'])->create()->id;
            },
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Product $product) {
            $imagesPool = [
                'placeholders/placeholder_1.jpg',
                'placeholders/placeholder_2.jpeg',
                'placeholders/placeholder_3.webp',
            ];

            $product->images()->create([
                'path' => $this->faker->randomElement($imagesPool),
                'is_main' => true,
                'position' => 0,
            ]);

            if (rand(0, 1)) {
                $product->images()->create([
                    'path' => $this->faker->randomElement($imagesPool),
                    'is_main' => false,
                    'position' => 1,
                ]);
            }
        });
    }
}
