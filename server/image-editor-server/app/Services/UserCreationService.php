<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserCreationService
{
    public static function createUser($userData)
    {
        try {
            $user = User::create([
                'username' => $userData['username'],
                'email' => $userData['email'],
                'password' => Hash::make($userData['password']),
            ]);
            
            return [
                "success" => true,
                'user' => $user,
            ];
            
        } catch (\Exception $e) {            
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}