<?php

namespace App\Services\Profile;

use App\Models\Profile;
use App\Traits\DeleteStoredFiles;
use Illuminate\Support\Facades\DB;

class ProfileAvatarService
{
    use DeleteStoredFiles;

    public function uploadAvatar(array $data, Profile $profile): Profile
    {
        $newAvatarPath = null;

        try {
            $avatarFile = $data['avatar'];

            $newAvatarPath = $avatarFile->store('avatars', 'public');

            [$profile, $oldAvatarPath] = DB::transaction(function () use ($newAvatarPath, $profile) {
                $lockedProfile = Profile::where('id', $profile->id)->lockForUpdate()->first();

                $oldAvatarPath = $lockedProfile->avatar;

                $lockedProfile->update([
                    'avatar' => $newAvatarPath,
                ]);

                return [$lockedProfile, $oldAvatarPath];
            });

            if ($oldAvatarPath) {
                $this->deleteStoredFiles([$oldAvatarPath]);
            }
        } catch (\Throwable $e) {
            if ($newAvatarPath) {
                $this->deleteStoredFiles([$newAvatarPath]);
            }

            throw $e;
        }

        return $profile->load('user');
    }
}
