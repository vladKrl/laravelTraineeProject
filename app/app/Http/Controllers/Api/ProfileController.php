<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\ProfileResource;
use App\Models\Profile;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ProfileController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum', except: ['show']),
        ];
    }

    public function show(Profile $profile): ProfileResource
    {
        $profile->load('user.products');

        return new ProfileResource($profile);
    }

    public function update(UpdateProfileRequest $request, Profile $profile): ProfileResource
    {
        $data = $request->validated();

        $profile->update($data);

        return new ProfileResource($profile->load('user'));
    }
}
