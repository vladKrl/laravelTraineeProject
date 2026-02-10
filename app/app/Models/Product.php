<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use const Grpc\STATUS_ABORTED;

class Product extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'label', 'picture_link', 'description', 'price', 'status_id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }

    public function status()
    {
        return $this->belongsTo(Status::class, 'status_id');
    }
}
