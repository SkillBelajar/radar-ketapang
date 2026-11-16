<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TargetSetup extends Model
{
    use HasFactory;

    protected $table = 'target_setups';

    protected $fillable = [
        'primary_keywords',
        'negative_keywords',
        'persona',
    ];

    protected $casts = [
        'primary_keywords' => 'array',
        'negative_keywords' => 'array',
    ];

    /**
     * Get or initialize the single global configuration record.
     */
    public static function getOrCreate(): self
    {
        return static::firstOrCreate([], [
            'primary_keywords' => [
                'Bupati Ketapang',
                'Pilkada Ketapang',
                'Pembangunan Ketapang',
                'Infrastruktur Jalan Pawan',
            ],
            'negative_keywords' => [
                'jual beli motor',
                'lowongan kerja',
                'promo pulsa',
                'casino slot',
            ],
            'persona' => 'Gaya bahasa merakyat, tegas, santun, dan solutif berbasis data pembangunan Ketapang.',
        ]);
    }
}
