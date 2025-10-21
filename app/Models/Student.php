<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Student extends Model
{
    use HasFactory, Notifiable;

    /**
     * The table associated with the model.
     */
    protected $table = 'students';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'student_id',
        'full_name',
        'email',
        'phone',
        'department',
        'year_level',
        'status',
        'enrollment_date',
        'date_of_birth',
        'address',
        'guardian_name',
        'guardian_phone',
    ];

    /**
     * The attributes that should be cast to native types.
     */
    protected $casts = [
        'enrollment_date' => 'date',
        'date_of_birth' => 'date',
        'year_level' => 'integer',
    ];

    /**
     * Scope to filter active students.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Custom accessor for formatted status.
     */
    public function getFormattedStatusAttribute()
    {
        return ucfirst($this->status);
    }
}

