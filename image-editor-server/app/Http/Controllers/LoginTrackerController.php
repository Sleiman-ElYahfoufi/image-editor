<?php

namespace App\Http\Controllers;

use App\Models\LoginTracker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LoginTrackerController extends Controller
{
    public function addDetails(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'ip_address' => 'required|ip',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $loginTracker = LoginTracker::create($validator->validated());

        return response()->json([
            'success' => true,
            'data' => $loginTracker
        ]);
    }
}