<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class TrackerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'username' => 'testuser'
        ]);
        
        $this->token = JWTAuth::fromUser($this->user);
    }

    public function test_can_add_login_details()
    {
        $loginDetails = [
            'user_id' => $this->user->id,
            'ip_address' => '192.168.1.1',
            'latitude' => 37.77,
            'longitude' => -122.41
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/v0.1/user/add-details', $loginDetails);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true
            ]);

        $this->assertDatabaseHas('login_trackers', [
            'user_id' => $this->user->id,
            'ip_address' => '192.168.1.1',
            'latitude' => 37.77,
            'longitude' => -122.41
        ]);
    }

    public function test_unauthorized_user_cannot_add_login_details()
    {
        $loginDetails = [
            'user_id' => $this->user->id,
            'ip_address' => '192.168.1.1',
            'latitude' => 37.77,
            'longitude' => -122.41
        ];

        $response = $this->postJson('/api/v0.1/user/add-details', $loginDetails);

        $response->assertStatus(401);

        $this->assertDatabaseMissing('login_trackers', [
            'user_id' => $this->user->id,
            'ip_address' => '192.168.1.1'
        ]);
    }

    

}