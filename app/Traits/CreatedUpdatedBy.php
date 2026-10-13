<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

trait CreatedUpdatedBy
{
    protected static function bootCreatedUpdatedBy()
    {
        static::creating(function ($model) {
            if (Auth::guard('admin')->check()) {
                $model->created_by = Auth::guard('admin')->id();
                $model->created_by_guard = 'admin';
            }
        });

        static::updating(function ($model) {
            if (Auth::guard('admin')->check()) {
                $model->updated_by = Auth::guard('admin')->id();
                $model->updated_by_guard = 'admin';
            }
        });
    }

    // Helpers for easy access in Blade
    public function createdByName()
    {
        return optional(\App\Models\Admin::find($this->created_by))->name;
    }

    public function updatedByName()
    {
        return optional(\App\Models\Admin::find($this->updated_by))->name;
    }
}
