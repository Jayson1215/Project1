<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faculty', function (Blueprint $table) {
            $table->id();
            $table->string('faculty_id')->unique();
            $table->string('full_name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('department');
            $table->string('position'); // Professor, Associate Professor, Assistant Professor, Lecturer
            $table->string('specialization')->nullable();
            $table->enum('employment_type', ['full-time', 'part-time', 'contract'])->default('full-time');
            $table->enum('status', ['active', 'inactive', 'on-leave', 'retired'])->default('active');
            $table->date('hire_date');
            $table->date('date_of_birth')->nullable();
            $table->text('address')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->string('emergency_phone')->nullable();
            $table->text('qualifications')->nullable(); // Degrees, certifications
            $table->integer('years_of_experience')->nullable();
            $table->timestamps();
            
            $table->index('department');
            $table->index('position');
            $table->index('status');
            $table->index('employment_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faculty');
    }
};

