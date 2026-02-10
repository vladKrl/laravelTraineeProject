<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\App;

use App\Models\User;
use App\Models\Status;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
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
//            'picture_link' => $this->faker->boolean(75) ? $this->faker->imageUrl(640, 480, 'product') : null,
            'description' => $this->faker->optional()->paragraph(),
            'price' => $this->faker->randomFloat(2, 1, 100),
            'status_id' => Status::factory(),
            'created_at' => now(),
        ];
    }
}
