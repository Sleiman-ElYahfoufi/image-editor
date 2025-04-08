<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateAuthRequest;
use App\Services\AuthService;
use App\Services\UserCreationService;

class AuthController extends Controller
{
    function login(CreateAuthRequest $request)
    {

        $response = AuthService::loginUser($request->validated());
        if (isset($response['error'])) {
            return $this->errorResponse($response['error'], 401);
        }

        return $this->successResponse($response, 201);
    }

    function signup(CreateAuthRequest $request)
    {

        $response = UserCreationService::createUser($request->validated());

        if (isset($response['error'])) {
            return $this->errorResponse($response['error'], 401);
        }

        return $this->successResponse($response, 201);
    }
}
