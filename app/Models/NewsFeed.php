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
        'velocity_score',
        'sentiment',
        'fact_anchor',
        'scripts',
        'ai_status',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'velocity_score' => 'integer',
        'fact_anchor' => 'array',
        'scripts' => 'array',
    ];
}
