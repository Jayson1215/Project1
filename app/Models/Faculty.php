<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    use HasFactory;

    protected $table = 'faculty';

    protected $fillable = [
        'faculty_id',
        'name',
        'email',
        'phone',
        'department_id',
        'position',
        'specialization',
        'hire_date',
        'status',
        'user_id',
    ];

    protected $casts = [
        'hire_date' => 'date',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}
