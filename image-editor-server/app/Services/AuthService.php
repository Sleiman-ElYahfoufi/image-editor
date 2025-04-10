<?php

namespace App\Services;
use Illuminate\Support\Facades\Auth;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthService
{
    public static function loginUser($userData)
    {
        try {
            $credentials = [
                "email" => $userData["email"],
                "password" => $userData["password"]
            ];
            if (!Auth::attempt($credentials)) {
                return [
                    "success" => false,
                    "error" => "Unauthorized"
                ];
            }

            $user = Auth::user();
            $user->token = JWTAuth::fromUser($user);


            return [
                "success" => true,
                "user" => $user
            ];
        } catch (\Exception $e) {
            return [
                'error' => $e->getMessage()
            ];
        }
    }
}
