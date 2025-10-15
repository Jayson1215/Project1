<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     * (Optional if table name = 'students')
     */
    protected $table = 'students';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'student_id',       // Unique student identifier
        'full_name',        // Student's full name
        'email',            // Email address (unique)
        'phone',            // Phone number (nullable)
        'department',       // Department name
        'year_level',       // 1, 2, 3, or 4
        'status',           // 'active' or 'inactive'
        'enrollment_date',  // Date of enrollment
        'date_of_birth',    // Birthdate (nullable)
        'address',          // Address (nullable)
        'guardian_name',    // Guardian's name (nullable)
        'guardian_phone',   // Guardian's phone (nullable)
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'enrollment_date' => 'date',
        'date_of_birth' => 'date',
    ];

    /**
     * Example relationships (optional)
     * Uncomment or adjust these if you link to other models later.
     */

    // Each student can belong to a user account (optional)
    // public function user()
    // {
    //     return $this->belongsTo(User::class);
    // }

    // Each student can be enrolled in multiple courses (optional)
    // public function courses()
    // {
    //     return $this->belongsToMany(Course::class, 'course_enrollments')
    //         ->withPivot('grade', 'status')
    //         ->withTimestamps();
    // }

    /**
     * Accessors or custom methods can be added below if needed
     * Example:
     * public function getFullDetailsAttribute()
     * {
     *     return "{$this->full_name} ({$this->student_id})";
     * }
     */
}
