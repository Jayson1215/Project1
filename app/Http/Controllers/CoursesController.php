<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class CoursesController extends Controller
{
    /**
     * Display the Courses Management page.
     */
    public function index()
    {
        return view('courses');
    }

    /**
     * Fetch all courses (API endpoint).
     */
    public function getCourses()
    {
        try {
            $courses = Course::with(['department', 'faculty'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($course) {
                    return [
                        'id' => $course->id,
                        'course_code' => $course->course_code,
                        'course_name' => $course->course_name,
                        'description' => $course->description,
                        'credits' => $course->credits,
                        'department_id' => $course->department_id,
                        'department_name' => $course->department->name ?? '',
                        'faculty_id' => $course->faculty_id,
                        'faculty_name' => $course->faculty->name ?? '',
                        'semester' => $course->semester,
                        'year_level' => $course->year_level,
                        'status' => $course->status,
                        'created_at' => $course->created_at,
                        'updated_at' => $course->updated_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $courses
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching courses',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Store a new course.
     */
    public function store(Request $request)
    {
        try {
            $deptTable = Schema::hasTable('departments') ? 'departments' : (Schema::hasTable('_departments') ? '_departments' : null);
            $facultyTable = Schema::hasTable('faculties') ? 'faculties' : (Schema::hasTable('faculty') ? 'faculty' : null);

            $rules = [
                'course_code' => 'required|string|max:50',
                'course_name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'credits' => 'nullable|integer|min:0',
                'semester' => 'nullable|string|max:50',
                'year_level' => 'nullable|string|max:10',
                'status' => ['nullable', Rule::in(['active','inactive'])],
                'department_name' => 'nullable|string|max:255',
                'department_id' => 'nullable|integer',
            ];

            if ($facultyTable) {
                $rules['faculty_id'] = 'nullable|integer|exists:' . $facultyTable . ',id';
            } else {
                $rules['faculty_id'] = 'nullable';
            }

            $validated = $request->validate($rules);

            // ✅ Check for duplicate course code
            if (Course::where('course_code', $validated['course_code'])->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course code already exists. Please use a different code.',
                ], 409);
            }

            // Resolve department: create or assign
            if (empty($validated['department_id']) && !empty($validated['department_name'])) {
                $name = trim($validated['department_name']);
                if (!$deptTable) {
                    return response()->json([
                        'error' => 'no_departments_table',
                        'message' => 'Departments table not found.',
                    ], 500);
                }

                $existingId = DB::table($deptTable)
                    ->whereRaw('LOWER(`name`) = ?', [mb_strtolower($name)])
                    ->value('id');

                if ($existingId) {
                    $validated['department_id'] = $existingId;
                } else {
                    $now = now();
                    $newId = DB::table($deptTable)->insertGetId([
                        'name' => $name,
                        'description' => '',
                        'status' => 'active',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                    $validated['department_id'] = $newId;
                }
            }

            $course = Course::create([
                'course_code' => $validated['course_code'],
                'course_name' => $validated['course_name'],
                'description' => $validated['description'] ?? '',
                'credits' => $validated['credits'] ?? null,
                'department_id' => $validated['department_id'] ?? null,
                'faculty_id' => $validated['faculty_id'] ?? null,
                'semester' => $validated['semester'] ?? '',
                'year_level' => $validated['year_level'] ?? '',
                'status' => $validated['status'] ?? 'active',
            ]);

            $course->load(['department', 'faculty']);

            return response()->json([
                'success' => true,
                'message' => 'Course created successfully',
                'data' => $course,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            return response()->json([
                'success' => false,
                'error' => 'validation',
                'messages' => $ve->errors(),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => 'exception',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a course.
     */
    public function update(Request $request, $id)
    {
        try {
            $course = Course::findOrFail($id);
            $deptTable = Schema::hasTable('departments') ? 'departments' : (Schema::hasTable('_departments') ? '_departments' : null);
            $facultyTable = Schema::hasTable('faculties') ? 'faculties' : (Schema::hasTable('faculty') ? 'faculty' : null);

            $rules = [
                'course_code' => 'required|string|max:50',
                'course_name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'credits' => 'nullable|integer|min:0',
                'semester' => 'nullable|string|max:50',
                'year_level' => 'nullable|string|max:10',
                'status' => ['nullable', Rule::in(['active', 'inactive'])],
                'department_name' => 'nullable|string|max:255',
                'department_id' => 'nullable|integer',
            ];

            if ($facultyTable) {
                $rules['faculty_id'] = 'nullable|integer|exists:' . $facultyTable . ',id';
            } else {
                $rules['faculty_id'] = 'nullable';
            }

            $validated = $request->validate($rules);

            // ✅ Duplicate check (ignore same record)
            $duplicate = Course::where('course_code', $validated['course_code'])
                ->where('id', '!=', $id)
                ->exists();
            if ($duplicate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course code already exists. Please use a different code.',
                ], 409);
            }

            if (empty($validated['department_id']) && !empty($validated['department_name'])) {
                $name = trim($validated['department_name']);
                if ($deptTable) {
                    $existingId = DB::table($deptTable)
                        ->whereRaw('LOWER(`name`) = ?', [mb_strtolower($name)])
                        ->value('id');

                    if ($existingId) {
                        $validated['department_id'] = $existingId;
                    } else {
                        $now = now();
                        $newId = DB::table($deptTable)->insertGetId([
                            'name' => $name,
                            'description' => '',
                            'status' => 'active',
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                        $validated['department_id'] = $newId;
                    }
                }
            }

            $course->update([
                'course_code' => $validated['course_code'],
                'course_name' => $validated['course_name'],
                'description' => $validated['description'] ?? '',
                'credits' => $validated['credits'] ?? null,
                'department_id' => $validated['department_id'] ?? $course->department_id,
                'faculty_id' => $validated['faculty_id'] ?? $course->faculty_id,
                'semester' => $validated['semester'] ?? '',
                'year_level' => $validated['year_level'] ?? '',
                'status' => $validated['status'] ?? $course->status,
            ]);

            $course->load(['department', 'faculty']);

            return response()->json([
                'success' => true,
                'message' => 'Course updated successfully',
                'data' => $course,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Course not found'], 404);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating course',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a course.
     */
    public function destroy($id)
    {
        try {
            $course = Course::findOrFail($id);

            if (method_exists($course, 'students')) {
                $count = $course->students()->count();
                if ($count > 0) {
                    return response()->json([
                        'success' => false,
                        'message' => "Cannot delete course. It has {$count} enrolled student(s).",
                    ], 409);
                }
            }

            $name = $course->course_name;
            $course->delete();

            return response()->json([
                'success' => true,
                'message' => "Course '{$name}' deleted successfully",
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting course',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
