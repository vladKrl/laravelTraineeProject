<?php

namespace App\Http\Controllers\Api;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Requests\Profile\UploadAvatarRequest;
use App\Http\Resources\ProfileResource;
use App\Models\Profile;
use App\Services\Profile\ProfileAvatarService;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ProfileController extends Controller implements HasMiddleware
{
    protected ProfileAvatarService $profileAvatarService;

    public function __construct(ProfileAvatarService $profileAvatarService)
    {
        $this->profileAvatarService = $profileAvatarService;
    }

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
            'user.products.mainImage',
            'user.products.categories'
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
        $profile = $this->profileAvatarService
            ->uploadAvatar(
                $request->validated(),
                $profile,
            );

        return new ProfileResource($profile);
    }
}
