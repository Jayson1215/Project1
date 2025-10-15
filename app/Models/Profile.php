<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $fillable = ['first_name', 'last_name'];

    // 🚫 Disable created_at / updated_at
    public $timestamps = false;
}
