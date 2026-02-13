<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Status;
use App\Models\User;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'testmail@example.com',
            'password' => bcrypt('password'),
        ]);

        $status = Status::factory()->create(['name' => 'active']);

        Product::factory()->count(5)->state([
                'user_id' => $user->id,
                'status_id' => $status->id,
        ])->create();
    }
}
