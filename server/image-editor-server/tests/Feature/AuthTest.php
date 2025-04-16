<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_signup()
    {
        $userData = [
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'password123'
        ];

        $response = $this->postJson('/api/v0.1/guest/signup', $userData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true
            ]);

        $this->assertDatabaseHas('users', [
            'username' => 'testuser',
            'email' => 'test@example.com'
        ]);
    }

    public function test_user_cannot_signup_with_existing_email()
    {
        User::factory()->create([
            'email' => 'existing@example.com',
            'username' => 'existinguser'
        ]);

        $userData = [
            'username' => 'newuser',
            'email' => 'existing@example.com',
            'password' => 'password123'
        ];

        $response = $this->postJson('/api/v0.1/guest/signup', $userData);

        $response->assertStatus(206)
            ->assertJson([
                'success' => false
            ]);

        $this->assertDatabaseMissing('users', [
            'username' => 'newuser'
        ]);
    }

    public function test_user_cannot_signup_with_existing_username()
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'username' => 'existinguser'
        ]);

        $userData = [
            'username' => 'existinguser', 
            'email' => 'new@example.com',
            'password' => 'password123'
        ];

        $response = $this->postJson('/api/v0.1/guest/signup', $userData);

        $response->assertStatus(206)
            ->assertJson([
                'success' => false
            ]);

        $this->assertDatabaseMissing('users', [
            'email' => 'new@example.com'
        ]);
    }

    public function test_user_can_login()
    {
        $user = User::factory()->create([
            'email' => 'login@example.com',
            'username' => 'loginuser',
            'password' => bcrypt('password123')
        ]);

        $loginData = [
            'username' => 'loginuser',
            'password' => 'password123'
        ];

        $response = $this->postJson('/api/v0.1/guest/login', $loginData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true
            ])
            ->assertJsonStructure([
                'success',
                'payload' => [
                    'user' => [
                        'id',
                        'username',
                        'email',
                        'token'
                    ]
                ]
            ]);
    }

    public function test_user_cannot_login_with_invalid_credentials()
    {
        $user = new User();
        $user->email = 'user@example.com';
        $user->username = 'validuser';
        $user->password = bcrypt('correctpassword');
        $user->save();

        $loginData = [
            'username' => 'validuser',
            'password' => 'wrongpassword'
        ];

        $response = $this->postJson('/api/v0.1/guest/login', $loginData);

        $response->assertStatus(202) 
            ->assertJson([
                'success' => false
            ]);
    }
}