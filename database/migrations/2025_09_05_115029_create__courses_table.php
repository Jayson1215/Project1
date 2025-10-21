    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;
    use Illuminate\Support\Facades\DB;

    return new class extends Migration
    {
        /**
         * Run the migrations.
         */
        public function up(): void
        {
            if (Schema::hasTable('courses')) {
                return;
            }

            Schema::create('courses', function (Blueprint $table) {
                $table->id();
                $table->string('course_code')->unique();
                $table->string('course_name');
                $table->text('description')->nullable();
                $table->unsignedTinyInteger('credits')->default(3);
                $table->unsignedBigInteger('department_id');
                $table->unsignedBigInteger('faculty_id')->nullable();
                $table->enum('semester', ['1', '2', 'summer'])->nullable();
                $table->enum('year_level', ['1', '2', '3', '4'])->nullable();
                $table->enum('status', ['active', 'inactive'])->default('active');
                $table->timestamps();
                $table->index(['department_id', 'faculty_id']);
                $table->index('status');
            });

            // determine actual departments table name (support '_departments' fallback)
            $deptTable = Schema::hasTable('departments') ? 'departments' : (Schema::hasTable('_departments') ? '_departments' : null);

            if ($deptTable) {
                // capture $deptTable into the closure
                Schema::table('courses', function (Blueprint $table) use ($deptTable) {
                    $table->foreign('department_id')
                        ->references('id')
                        ->on($deptTable)
                        ->cascadeOnDelete();
                });
            } else {
                DB::statement("/* courses migration: referenced table 'departments' not found; FK not added */");
            }

            $facultyTable = null;
            if (Schema::hasTable('faculties')) {
                $facultyTable = 'faculties';
            } elseif (Schema::hasTable('faculty')) {
                $facultyTable = 'faculty';
            }

            if ($facultyTable) {
                Schema::table('courses', function (Blueprint $table) use ($facultyTable) {
                    $table->foreign('faculty_id')
                        ->references('id')
                        ->on($facultyTable)
                        ->nullOnDelete();
                });
            } else {
                DB::statement("/* courses migration: referenced table for faculty not found (checked 'faculties' and 'faculty'); FK not added */");
            }
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            // drop constraints if exist then drop table
            if (Schema::hasTable('courses')) {
                Schema::table('courses', function (Blueprint $table) {
                    // guard: drop foreign keys if they exist
                    try { $table->dropForeign(['department_id']); } catch (\Throwable $e) {}
                    try { $table->dropForeign(['faculty_id']); } catch (\Throwable $e) {}
                });
                Schema::dropIfExists('courses');
            }
        }
    };
