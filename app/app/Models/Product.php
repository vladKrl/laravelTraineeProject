<?php

namespace App\Models;

use App\Enums\ProductStatus;
use App\Observers\ProductObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use JeroenG\Explorer\Application\Explored;
use Laravel\Scout\Searchable;
use Illuminate\Database\Eloquent\Builder;

#[ObservedBy(ProductObserver::class)]
class Product extends Model implements Explored
{
    use HasFactory, SoftDeletes, Searchable;

    protected $fillable = ['user_id', 'label', 'picture_link', 'description', 'price', 'status', 'region_id', 'city_id'];

    protected function casts(): array
    {
        return [
            'status' => ProductStatus::class,
        ];
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function categories(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function images(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position');
    }

    public function mainImage(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ProductImage::class)->where('is_main', true);
    }

    public function region(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Location::class, 'region_id');
    }

    public function city(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Location::class, 'city_id');
    }

    public function toSearchableArray(): array
    {
        return [
            'id'            => $this->id,
            'label'         => $this->label,
            'description'   => $this->description,
            'status'        => $this->status,
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
            'status'        => 'keyword',
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
