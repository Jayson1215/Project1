<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'head_faculty_id',
        'building',
        'contact_email',
        'contact_phone',
        'status',
    ];

    // Relationships
    public function headFaculty()
    {
        return $this->belongsTo(Faculty::class, 'head_faculty_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function faculty()
    {
        return $this->hasMany(Faculty::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}
