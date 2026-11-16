<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UatChecklist extends Model
{
    protected $fillable = [
        'user_id',
        'step_key',
        'is_checked',
        'tester_notes',
        'completed_at',
    ];

    protected $casts = [
        'is_checked' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
