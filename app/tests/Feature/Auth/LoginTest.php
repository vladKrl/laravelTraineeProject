<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_throttle_login_returns_429(): void
    {
        $user = User::factory()->create();

        $payload = [
            'email'         => $user->email,
            'password'      => 'Invalid password',
        ];

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/login', $payload);
        }

        $response = $this->postJson('/login', $payload);

        $response->assertStatus(429);
    }
}
