<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;

trait DeleteStoredFiles
{
    public function deleteStoredFiles(array $paths): void
    {
        if (!empty($paths)) {
            Storage::disk('public')->delete($paths);
        }
    }
}
