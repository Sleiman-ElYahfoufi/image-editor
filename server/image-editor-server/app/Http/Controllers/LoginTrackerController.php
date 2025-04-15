<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginTrackerRequest;
use App\Services\LoginTrackerService;

class LoginTrackerController extends Controller
{
    public function addDetails(LoginTrackerRequest $request)
    {

        $response = LoginTrackerService::createDetails($request->validated());
        if (isset($response['error'])) {
            return $this->errorResponse($response, 401);
        }
        return $this->successResponse($response, 201);
    }
}
