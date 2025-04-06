<?php

namespace App\Http\Controllers;

use App\Models\LoginTracker;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                "msg" => "Missing Fields",
                "errors" => $validator->errors()
            ], 422);
        }

        $credentials = [
            "email" => $request->email,
            "password" => $request->password
        ];

        if (!Auth::attempt($validator->validated())) {
            return response()->json([
                "success" => false,
                "msg" => "Unauthorized"
            ], 401);
        }

        $user = Auth::user();
        $user->token = JWTAuth::fromUser($user);

        $trackingRequest = new Request([
            "user_id" => $user->id,
            "ip_address" => $request->ip_address,
            "latitude" => $request->latitude,
            "longitude" => $request->longitude,
        ]);

        $loginTrackerController = new LoginTrackerController();
        $response =  $loginTrackerController->addDetails($trackingRequest);
        if ($response->getStatusCode() !== 200) {
            $responseContent = json_decode($response->getContent(), true);

            return response()->json([
                "success" => false,
                "error" => "Login tracking failed",
                "details" => $responseContent
            ], $response->getStatusCode());
        }


        return response()->json([
            "success" => true,
            "user" => $user
        ]);
    }

    function signup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {

            return response()->json([
                "errors" => $validator->errors()
            ], 422);
        }

        $user = new User;
        $user->email = $request->email;
        $user->password = bcrypt($request->password);
        $user->save();

        return response()->json([
            "success" => true,
            "msg" => "Sign Up Successful!"
        ]);
    }
}
