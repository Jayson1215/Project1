<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('head_faculty_id')->nullable();
            $table->string('building', 100)->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone', 20)->nullable();
            $table->string('status')->default('Active');
            $table->timestamps();

            // Remove this foreign key constraint
            // $table->foreign('head_faculty_id')->references('id')->on('faculty')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('departments');
    }
};