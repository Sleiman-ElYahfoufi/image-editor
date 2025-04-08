<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserCreationService
{
    public static function createUser(array $userData)
    {
        try {
            $user = User::create([
                'email' => $userData['email'],
                'password' => Hash::make($userData['password']),
            ]);
            
            return [
                'user' => $user,
            ];
            
        } catch (\Exception $e) {            
            return [
                'error' => $e->getMessage()];
        }
    }
}