<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Location;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;
use App\Enums\ProductStatus;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            [
                'email' => 'testmail@example.com'
            ],
            [
            'name' => 'Test User',
            'password' => bcrypt('password'),
            ],
        );

        if (Location::count() === 0) {
            Location::factory()
                ->count(3)
                ->create()
                ->each(function ($region) {
                    Location::factory()->count(5)->city($region->id)->create();
                });
        }

        Product::factory()
            ->count(5)
            ->has(Category::factory()->count(rand(1,5)))
            ->create([
                'user_id' => $user->id,
                'status' => ProductStatus::ACTIVE,
            ])
            ->each(function ($product) {
                $city = Location::whereNotNull('parent_id')->inRandomOrder()->first();

                if ($city) {
                    $product->update([
                        'city_id' => $city->id,
                        'region_id' => $city->parent_id,
                    ]);
                }
            });

        Cache::flush();
    }
}
