<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use Illuminate\Validation\Rule;

class CoursesController extends Controller
{
    /**
     * Display the courses management page
     */
    public function index()
    {
        return view('courses');
    }

    /**
     * Get all courses (API)
     */
    public function getCourses()
    {
        $courses = Course::with(['department', 'faculty'])->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $courses
        ]);
    }

    /**
     * Store a new course
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_code' => 'required|string|unique:courses,course_code',
            'course_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'credits' => 'required|integer|min:1|max:6',
            'department_id' => 'required|exists:departments,id',
            'faculty_id' => 'nullable|exists:faculty,id',
            'semester' => 'required|in:1,2,summer',
            'year_level' => 'required|in:1,2,3,4',
            'status' => 'required|in:active,inactive'
        ]);

        $course = Course::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Course created successfully',
            'data' => $course
        ], 201);
    }

    /**
     * Display the specified course
     */
    public function show($id)
    {
        $course = Course::with(['department', 'faculty'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $course
        ]);
    }

    /**
     * Update the specified course
     */
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'course_code' => ['sometimes', 'required', 'string', Rule::unique('courses')->ignore($course->id)],
            'course_name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'credits' => 'sometimes|required|integer|min:1|max:6',
            'department_id' => 'sometimes|required|exists:departments,id',
            'faculty_id' => 'sometimes|nullable|exists:faculty,id',
            'semester' => 'sometimes|required|in:1,2,summer',
            'year_level' => 'sometimes|required|in:1,2,3,4',
            'status' => 'sometimes|required|in:active,inactive'
        ]);

        $course->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Course updated successfully',
            'data' => $course
        ]);
    }

    /**
     * Remove the specified course
     */
    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();

        return response()->json([
            'success' => true,
            'message' => 'Course deleted successfully'
        ]);
    }
}
