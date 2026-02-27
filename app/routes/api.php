<?php

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Resources\UserResource;

Route::get('/user', function (Request $request) {
    return  new UserResource($request->user());
})->middleware('auth:sanctum');

Route::get('/products', [ProductController::class, 'index']);

Route::get('/categories', function () {
    return Category::all();
});

Route::apiResource('products', ProductController::class);
