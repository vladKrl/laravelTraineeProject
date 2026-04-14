<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LocationController extends Controller
{
    public function index(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $parentId = $request->query('parent_id');

        $locations = Cache::remember("locations_" . ($parentId ?? 'all'), now()->addWeek(), function () use ($parentId) {
            return Location::query()
                ->when($parentId, function ($query, $parentId) {
                    return $query->where('parent_id', $parentId);
                }, function ($query) {
                    return $query->whereNull('parent_id');
                })
                ->orderBy('name')
                ->get();
        });

        return LocationResource::collection($locations);
    }
}
