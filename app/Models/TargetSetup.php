<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TargetSetup extends Model
{
    use HasFactory;

    protected $table = 'target_setups';

    protected $fillable = [
        'candidate_name',
        'political_role',
        'electoral_district',
        'branding_tagline',
        'branding_pillars',
        'branding_goal',
        'primary_keywords',
        'negative_keywords',
        'persona',
    ];

    protected $casts = [
        'branding_pillars' => 'array',
        'primary_keywords' => 'array',
        'negative_keywords' => 'array',
    ];

    /**
     * Get or initialize the single global configuration record.
     */
    public static function getOrCreate(): self
    {
        return static::firstOrCreate([], [
            'candidate_name' => '',
            'political_role' => 'Calon Kepala Daerah (Bupati/Walikota/Gubernur)',
            'electoral_district' => 'Daerah Pemilihan / Wilayah Basis',
            'branding_tagline' => 'Bekerja Nyata untuk Kesejahteraan & Keadilan Warga',
            'branding_pillars' => [
                'Infrastruktur Konektivitas Jalan Poros & Jembatan',
                'Stabilitas Harga Sembako, Pupuk & Hasil Tani/Kebun',
                'Peningkatan Mutu Puskesmas & Layanan RS Bebas Pungli',
                'Pembukaan Lapangan Kerja Pemuda & Dukungan UMKM',
            ],
            'branding_goal' => 'Membangun persepsi kepemimpinan yang merakyat, cepat tanggap, solutif, dan membela kepentingan masyarakat di ruang publik maupun media sosial.',
            'primary_keywords' => [
                'Pilkada',
                'Calon Kepala Daerah',
                'Infrastruktur Jalan',
                'Ekonomi Kerakyatan',
            ],
            'negative_keywords' => [
                'jual beli motor',
                'lowongan kerja',
                'promo pulsa',
                'casino slot',
            ],
            'persona' => 'Gaya bahasa merakyat, tenang namun tegas, berorientasi solusi nyata, dan mengedepankan empati keluarga besar masyarakat.',
        ]);
    }
}
