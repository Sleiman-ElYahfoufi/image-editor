<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateAuthRequest;
use App\Http\Requests\LoginAuthRequest;
use App\Services\AuthService;
use App\Services\UserCreationService;


class AuthController extends Controller
{
    function login(LoginAuthRequest $request)
    {


        $response = AuthService::loginUser($request->validated());
        if ($response['success']==false) {
            return $this->errorResponse($response, 202);
        }

        return $this->successResponse($response, 201);
    }

    function signup(CreateAuthRequest $request)
    {

        $response = UserCreationService::createUser($request->validated());

        if ($response['success']==false) {
            return $this->errorResponse($response, 401);
        }


        return $this->successResponse($response, 201);
    }
}
