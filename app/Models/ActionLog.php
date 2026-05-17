<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActionLog extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'performed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function observation()
    {
        return $this->belongsTo(FieldObservation::class);
    }

    public function recommendation()
    {
        return $this->belongsTo(Recommendation::class);
    }
}
