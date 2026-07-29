<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_throttle_register_returns_429(): void
    {
        $payload = [
            'name'                  => 'Test User',
            'email'                 => 'Invalid email',
            'password'              => 'Password',
            'password_confirmation' => 'Password',
        ];

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/register', $payload);
        }

        $response = $this->postJson('/register', $payload);

        $response->assertStatus(429);
    }
}
