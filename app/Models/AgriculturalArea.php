<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgriculturalArea extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'location_name',
        'area_size',
        'soil_type',
        'notes',
        'geometry',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function fieldObservations(): HasMany
    {
        return $this->hasMany(FieldObservation::class);
    }
}
