<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = [
        'course_code',
        'course_name',
        'description',
        'credits',
        'department_id',
        'faculty_id',
        'semester',
        'year_level',
        'status',
    ];

    public function faculty()
    {
        return $this->belongsTo(\App\Models\Faculty::class, 'faculty_id');
    }

    public function department()
    {
        return $this->belongsTo(\App\Models\Department::class, 'department_id');
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'course_enrollments')
            ->withPivot('grade', 'status')
            ->withTimestamps();
    }
}
