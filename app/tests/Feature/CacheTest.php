<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CacheTest extends TestCase
{
    public function test_active_cache_store_supports_tagging(): void
    {
        $this->assertTrue(
            Cache::supportsTags(),
            'Active cache store must support tagging',
        );
    }

    public function test_database_cache_store_fails_tag_support_check()
    {
        config(['cache.default' => 'database']);

        $this->assertFalse(
            Cache::supportsTags(),
            'Database cache store must fail tag support check',
        );

    }
}
