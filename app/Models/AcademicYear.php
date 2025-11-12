<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    use HasFactory;

    protected $table = 'academic_years';

    protected $fillable = [
        'year_name',
        'start_date',
        'end_date',
        'semesters',
        'current_semester',
        'total_students',
        'is_current',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'semesters' => 'integer',
        'total_students' => 'integer',
        'is_current' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($academicYear) {
            if ($academicYear->is_current) {
                static::where('is_current', true)->update(['is_current' => false]);
            }
        });

        static::updating(function ($academicYear) {
            if ($academicYear->is_current && $academicYear->isDirty('is_current')) {
                static::where('id', '!=', $academicYear->id)
                    ->where('is_current', true)
                    ->update(['is_current' => false]);
            }
        });
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('status', 'upcoming');
    }

    public function isActive()
    {
        return $this->status === 'active';
    }

    public function isCurrent()
    {
        return $this->is_current === true;
    }
}