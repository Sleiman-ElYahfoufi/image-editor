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
                'user' => $user,
            ];
            
        } catch (\Exception $e) {            
            return [
                'error' => $e->getMessage(),
                "stuff" => $userData];
        }
    }
}