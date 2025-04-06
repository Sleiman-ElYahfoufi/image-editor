<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LoginTrackerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::group(["prefix" => "v0.1"], function () {

    Route::group(["middleware" => "auth:api"], function () {

        Route::group(["prefix" => "user"], function () {
            Route::get('/add-details', [LoginTrackerController::class, "addDetails"]);
        });
    });

    Route::group(["prefix" => "guest"], function () {

        Route::post('/login', [AuthController::class, "login"]);

        Route::post('/signup', [AuthController::class, "signup"]);
    });
});
