<?php

namespace App\Http\Controllers\Api;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Requests\Profile\UploadAvatarRequest;
use App\Http\Resources\ProfileResource;
use App\Models\Profile;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Storage;

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
        $isOwner = auth('sanctum')->id() === $profile->user_id;

        $profile->load([
            'user.products' => function ($query) use ($isOwner) {
                if (!$isOwner) {
                    $query->where('status', ProductStatus::ACTIVE->value);
                }},
            'user.products.images',
            'user.products.mainImage'
        ]);

        return new ProfileResource($profile);
    }

    public function update(UpdateProfileRequest $request, Profile $profile): ProfileResource
    {
        $data = $request->validated();

        $profile->update($data);

        return new ProfileResource($profile->load('user'));
    }

    public function uploadAvatar(UploadAvatarRequest $request, Profile $profile): ProfileResource
    {
        $avatarFile = $request->file('avatar');

        if ($profile->avatar) {
            Storage::disk('public')->delete($profile->avatar);
        }

        $avatarPath = $avatarFile->store('avatars', 'public');

        $profile->update([
            'avatar' => $avatarPath,
        ]);

        return new ProfileResource($profile->load('user'));
    }
}
