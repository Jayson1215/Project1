<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Faculty extends Model
{
    use HasFactory, Notifiable;

    /**
     * The table associated with the model.
     */
    protected $table = 'faculty';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'faculty_id',
        'full_name',
        'email',
        'phone',
        'department',
        'position',
        'specialization',
        'employment_type',
        'status',
        'hire_date',
        'date_of_birth',
        'address',
        'emergency_contact',
        'emergency_phone',
        'qualifications',
        'years_of_experience',
    ];

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = [
        'hire_date' => 'date',
        'date_of_birth' => 'date',
        'years_of_experience' => 'integer',
    ];

    /**
     * Scope to filter active faculty.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to filter by department.
     */
    public function scopeByDepartment($query, $department)
    {
        return $query->where('department', $department);
    }

    /**
     * Scope to filter by position.
     */
    public function scopeByPosition($query, $position)
    {
        return $query->where('position', $position);
    }

    /**
     * Custom accessor for formatted status.
     */
    public function getFormattedStatusAttribute()
    {
        return ucfirst($this->status);
    }

    /**
     * Custom accessor for formatted employment type.
     */
    public function getFormattedEmploymentTypeAttribute()
    {
        return ucfirst(str_replace('-', ' ', $this->employment_type));
    }
}

