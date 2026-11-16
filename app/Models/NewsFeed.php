<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsFeed extends Model
{
    use HasFactory;

    protected $table = 'news_feeds';

    protected $fillable = [
        'title',
        'source',
        'url',
        'published_at',
        'raw_content',
        'status',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];
}
