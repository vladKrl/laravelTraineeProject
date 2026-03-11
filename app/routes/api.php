<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Resources\UserResource;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProfileController;

Route::get('/user', function (Request $request) {
    return new UserResource($request->user());
})->middleware('auth:sanctum');

Route::apiResource('categories', CategoryController::class)->only(['index']);

Route::apiResource('products', ProductController::class)->only(['index', 'store', 'show', 'update', 'destroy']);

Route::apiResource('profile', ProfileController::class)->only(['show', 'update']);
