<?php

namespace App\Enums;

enum ProductStatus: string
{
    case ACTIVE = 'active';
    case ARCHIVED = 'archived';
    case DRAFT = 'draft';

    public function label(): string
    {
        return match($this) {
            self::ACTIVE => 'active',
            self::ARCHIVED => 'archived',
            self::DRAFT => 'draft',
        };
    }
}
