<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('student_id')->unique();
            $table->string('full_name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('department');
            $table->integer('year_level'); // 1, 2, 3, 4
            $table->enum('status', ['active', 'inactive', 'graduated', 'suspended'])->default('active');
            $table->date('enrollment_date');
            $table->date('date_of_birth')->nullable();
            $table->text('address')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_phone')->nullable();
            $table->timestamps();
            
            $table->index('department');
            $table->index('year_level');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};