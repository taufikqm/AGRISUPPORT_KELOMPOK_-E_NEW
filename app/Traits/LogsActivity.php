<?php

namespace App\Traits;

use App\Models\ActionLog;

trait LogsActivity
{
    public static function bootLogsActivity()
    {
        // When created
        static::created(function ($model) {
            self::logAction($model, 'created');
        });

        // When updated
        static::updated(function ($model) {
            self::logAction($model, 'updated');
        });

        // When deleted
        static::deleted(function ($model) {
            self::logAction($model, 'deleted');
        });
    }

    protected static function logAction($model, $actionType)
    {
        // Only log if we have an authenticated user
        if (!auth()->check()) {
            return;
        }

        $oldValues = null;
        $newValues = null;

        if ($actionType === 'updated') {
            $newValues = $model->getChanges();
            // Get original values only for the changed columns
            $oldValues = array_intersect_key($model->getOriginal(), $newValues);
        } elseif ($actionType === 'created') {
            $newValues = $model->getAttributes();
        } elseif ($actionType === 'deleted') {
            $oldValues = $model->getAttributes();
        }

        // Determine area ID if the model has it or is the area itself
        $areaId = null;
        if (isset($model->agricultural_area_id)) {
            $areaId = $model->agricultural_area_id;
        } elseif (class_basename($model) === 'AgriculturalArea') {
            $areaId = $model->id;
        }

        // Action prefix based on model
        $modelName = class_basename($model);
        $fullAction = strtolower($modelName) . '_' . $actionType;

        $detail = "Melakukan " . $actionType . " pada " . $modelName . " (ID: " . $model->id . ")";

        ActionLog::create([
            'user_id' => auth()->id(),
            'agricultural_area_id' => $areaId,
            'action_type' => $fullAction,
            'detail' => $detail,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'performed_at' => now(),
        ]);
    }
}
