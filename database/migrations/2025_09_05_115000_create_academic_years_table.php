<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();

            // Academic Year Information
            $table->string('year_name')->unique(); // ex: "2024-2025"
            $table->date('start_date');
            $table->date('end_date');

            // ✅ Match Model & Controller
            $table->integer('semesters')->default(2); // total number of semesters
            $table->string('current_semester')->nullable(); // current active semester
            $table->integer('total_students')->default(0); // count of enrolled students

            $table->boolean('is_current')->default(false);

            // ✅ Add "upcoming" to match controller usage
            $table->enum('status', ['active', 'inactive', 'completed', 'upcoming'])->default('upcoming');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_years');
    }
};
