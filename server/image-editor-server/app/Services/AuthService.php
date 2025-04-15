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
                "username" => $userData["username"],
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
