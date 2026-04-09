<?php

use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\MessageController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Resources\UserResource;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ConversationController;

Route::get('/user', function (Request $request) {
    return new UserResource($request->user());
})->middleware('auth:sanctum');

Route::apiResource('categories', CategoryController::class)->only(['index']);

Route::apiResource('products', ProductController::class)->only(['index', 'store', 'show', 'update', 'destroy']);

Route::post('products/{product}/images', [ProductController::class, 'uploadImages']);

Route::delete('products/{product}/images/{image}', [ProductController::class, 'deleteImage'])->scopeBindings();

Route::apiResource('profile', ProfileController::class)->only(['show', 'update']);

Route::post('profile/{profile}/avatar', [ProfileController::class, 'uploadAvatar']);

Route::apiResource('conversations', ConversationController::class)->only(['index', 'store', 'show']);

Route::post('conversations/{conversation}/messages', [MessageController::class, 'store']);

Route::post('products/{product}/favorites', [FavoriteController::class, 'toggle']);

Route::get('favorites', [FavoriteController::class, 'index']);
