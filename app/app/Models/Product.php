<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use JeroenG\Explorer\Application\Explored;
use Laravel\Scout\Searchable;
use Illuminate\Database\Eloquent\Builder;

class Product extends Model implements Explored
{
    use HasFactory, SoftDeletes, Searchable;

    protected $fillable = ['user_id', 'label', 'picture_link', 'description', 'price', 'status_id'];

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function categories(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function status(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Status::class, 'status_id');
    }

    public function images(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position');
    }

    public function mainImage(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ProductImage::class)->where('is_main', true);
    }

    public function toSearchableArray(): array
    {
        return [
            'id'            => $this->id,
            'label'         => $this->label,
            'description'   => $this->description,
            'created_at'    => $this->created_at,
            'categories'    => $this->categories->map(function ($category) {
                return [
                    'id'    => $category->id,
                    'label' => $category->label,
                ];
            })->toArray(),
        ];
    }

    protected function makeAllSearchableUsing(Builder $query): Builder
    {
        return $query->with(['categories', 'images']);
    }

    public function mappableAs(): array
    {
        return [
            'id'            => 'keyword',
            'label'         => 'text',
            'description'   => 'text',
            'created_at'    => 'date',
            'categories'    => [
                'type'      => 'nested',
                'properties'=> [
                    'id'    => 'keyword',
                    'label' => 'text',
                ],
            ],
        ];
    }
}
