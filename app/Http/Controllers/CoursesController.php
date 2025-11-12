<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\Faculty;
use App\Models\Department;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Exception;

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
                    $faculty = $course->faculty;
                    $facultyName = $faculty->full_name ?? $faculty->name ?? null;

                    return [
                        'id' => $course->id,
                        'course_code' => $course->course_code,
                        'course_name' => $course->course_name,
                        'description' => $course->description,
                        'credits' => $course->credits,
                        'department_id' => $course->department_id,
                        'department_name' => $course->department->name ?? '',
                        // keep legacy keys
                        'faculty_id' => $course->faculty_id,
                        'faculty_name' => $facultyName,
                        // frontend expects instructor_*
                        'instructor_id' => $course->instructor_id ?? $course->faculty_id,
                        'instructor_name' => $course->instructor_name ?? $facultyName,
                        'instructor_email' => $faculty->email ?? null,
                        'semester' => $course->semester,
                        'year_level' => $course->year_level,
                        'status' => $course->status,
                        'created_at' => $course->created_at,
                        'updated_at' => $course->updated_at,
                    ];
                });

            return response()->json(['success' => true, 'data' => $courses], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error fetching courses', 'error' => config('app.debug') ? $e->getMessage() : 'Server error'], 500);
        }
    }

    /**
     * Store a new course.
     */
    public function store(Request $request)
    {
        $rules = [
            'course_code' => 'required|string',
            'course_name' => 'required|string',
            'department_id' => 'required|integer|exists:departments,id',
            'credits' => 'nullable|integer',
            'faculty_id' => 'nullable|integer|exists:faculty,id',
            // allow instructor_id as alias
            'instructor_id' => 'nullable|integer|exists:faculty,id',
            'instructor_name' => 'nullable|string',
            'instructor_email' => 'nullable|email',
        ];

        $validated = $request->validate($rules);

        // map instructor_id -> faculty_id (frontend may send instructor_id)
        if ($request->filled('instructor_id') && empty($validated['faculty_id'])) {
            $validated['faculty_id'] = $request->input('instructor_id');
        }

        // keep instructor_* fields on model
        if ($request->filled('instructor_id')) {
            $validated['instructor_id'] = $request->input('instructor_id');
        }
        if ($request->filled('instructor_name')) {
            $validated['instructor_name'] = $request->input('instructor_name');
        }
        if ($request->filled('instructor_email')) {
            $validated['instructor_email'] = $request->input('instructor_email');
        }

        $course = Course::create($validated);
        $course->load(['department', 'faculty']);

        return response()->json(['success' => true, 'data' => $course], 201);
    }

    /**
     * Update a course.
     */
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $rules = [
            'course_code' => 'sometimes|required|string',
            'course_name' => 'sometimes|required|string',
            'department_id' => 'sometimes|required|integer|exists:departments,id',
            'credits' => 'nullable|integer',
            'faculty_id' => 'nullable|integer|exists:faculty,id',
            'instructor_id' => 'nullable|integer|exists:faculty,id',
            'instructor_name' => 'nullable|string',
            'instructor_email' => 'nullable|email',
        ];

        $validated = $request->validate($rules);

        // accept instructor_id as alias for faculty_id
        if ($request->has('instructor_id')) {
            $validated['faculty_id'] = $request->input('instructor_id');
            $validated['instructor_id'] = $request->input('instructor_id');
        }

        if ($request->has('instructor_name')) {
            $validated['instructor_name'] = $request->input('instructor_name');
        }
        if ($request->has('instructor_email')) {
            $validated['instructor_email'] = $request->input('instructor_email');
        }

        $course->update($validated);
        $course->load(['department', 'faculty']);

        // return the same shape as index (so frontend mapping works)
        $faculty = $course->faculty;
        $facultyName = $faculty->full_name ?? $faculty->name ?? null;

        $payload = array_merge($course->toArray(), [
            'faculty_name' => $facultyName,
            'instructor_id' => $course->instructor_id ?? $course->faculty_id,
            'instructor_name' => $course->instructor_name ?? $facultyName,
            'instructor_email' => $faculty->email ?? $course->instructor_email ?? null,
        ]);

        return response()->json(['success' => true, 'data' => $payload], 200);
    }

    /**
     * Delete a course with student dependency confirmation.
     *
     * Accepts force via query param (?force=true) or request input (force or force_delete).
     * Also used by legacy POST /{id}/delete endpoint if routed.
     */
    public function destroy(Request $request, $id)
    {
        try {
            $course = Course::findOrFail($id);

            // Accept multiple ways to pass "force"
            $force = false;
            if ($request->query('force') !== null) {
                $force = strtolower($request->query('force')) === 'true';
            } elseif ($request->has('force')) {
                $force = $request->input('force') === true || $request->input('force') === 'true' || $request->input('force') === 1 || $request->input('force') === '1';
            } elseif ($request->has('force_delete')) {
                $force = $request->input('force_delete') === true || $request->input('force_delete') === 'true' || $request->input('force_delete') === 1 || $request->input('force_delete') === '1';
            }

            // Determine enrolled count (supports both pivot and course_id patterns)
            $enrolledCount = 0;
            if (method_exists($course, 'students')) {
                try {
                    $enrolledCount = $course->students()->count();
                } catch (\Throwable $e) {
                    // ignore and fallback
                    $enrolledCount = 0;
                }
            }

            // Fallback: if Student has a course_id column pattern
            if ($enrolledCount === 0) {
                try {
                    $enrolledCount = Student::where('course_id', $id)->count();
                } catch (\Throwable $e) {
                    // ignore
                }
            }

            if ($enrolledCount > 0 && ! $force) {
                return response()->json([
                    'success' => false,
                    'has_students' => true,
                    'student_count' => $enrolledCount,
                    'message' => "This course has {$enrolledCount} enrolled student(s).",
                ], 409);
            }

            // Perform deletion inside a transaction
            DB::transaction(function () use ($course, $id, $enrolledCount, $force) {
                // If pivot relation exists, detach
                if (method_exists($course, 'students')) {
                    try {
                        if ($enrolledCount > 0) {
                            $course->students()->detach();
                        }
                    } catch (\Throwable $e) {
                        // ignore detach failures and try fallback below
                    }
                }

                // Fallback: null out course_id on students if that pattern is used
                try {
                    Student::where('course_id', $id)->update(['course_id' => null]);
                } catch (\Throwable $e) {
                    // ignore
                }

                // Use model's helper if present
                if (method_exists($course, 'deleteWithEnrollments')) {
                    // deleteWithEnrollments will force delete if $force true
                    $course->deleteWithEnrollments($force);
                } else {
                    // If model uses SoftDeletes, do a forceDelete to remove permanently.
                    if (in_array('Illuminate\\Database\\Eloquent\\SoftDeletes', class_uses($course))) {
                        $course->forceDelete();
                    } else {
                        $course->delete();
                    }
                }
            });

            return response()->json([
                'success' => true,
                'message' => "Course '{$course->course_name}' deleted successfully",
                'deleted_id' => $id,
            ], 200);
        } catch (Exception $e) {
            // If our model throws an Exception with code 409, reflect that to frontend
            if ((int) $e->getCode() === 409) {
                return response()->json([
                    'success' => false,
                    'has_students' => true,
                    'student_count' => method_exists($course ?? null, 'students') ? ($course->students()->count() ?? 0) : 0,
                    'message' => $e->getMessage() ?: 'Course has enrolled students',
                ], 409);
            }

            return response()->json([
                'success' => false,
                'message' => 'Error deleting course',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error',
            ], 500);
        }
    }

    /**
     * Legacy handler for POST /courses/{id}/delete (routes may point here).
     */
    public function deleteViaPost(Request $request, $id)
    {
        return $this->destroy($request, $id);
    }
}
