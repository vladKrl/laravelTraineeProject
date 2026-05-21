<?php

namespace App\Services\Profile;

use App\Models\Profile;
use Illuminate\Support\Facades\Storage;

class ProfileAvatarService
{
    public function uploadAvatar(array $data, Profile $profile): Profile
    {
        $avatarFile = $data['avatar'];

        if ($profile->avatar) {
            Storage::disk('public')->delete($profile->avatar);
        }

        $avatarPath = $avatarFile->store('avatars', 'public');

        $profile->update([
            'avatar' => $avatarPath,
        ]);

        return $profile->load('user');
    }
}
