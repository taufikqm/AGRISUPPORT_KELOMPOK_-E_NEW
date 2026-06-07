<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Traits\LogsActivity;

class FieldObservation extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'user_id',
        'agricultural_area_id',
        'planting_cycle',
        'observation_date',
        'soil_moisture',
        'water_puddle',
        'crop_condition',
        'pest_indication',
        'disease_indication',
        'notes',
        'weather_temp',
        'weather_condition',
        'weather_humidity',
        'weather_wind_kph',
        'weather_precip_mm',
        'weather_soil_moisture',
        'recommendations_viewed_at',
    ];

    protected $casts = [
        'observation_date'           => 'date',
        'recommendations_viewed_at'  => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function agriculturalArea(): BelongsTo
    {
        return $this->belongsTo(AgriculturalArea::class);
    }
}
