<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class FacultyController extends Controller
{
    /**
     * Display the Faculty Management page (VIEW)
     */
    public function index()
    {
        return view('faculty');
    }

    /**
     * Fetch all faculty members (API endpoint)
     */
    public function getFaculty()
    {
        try {
            $faculty = Faculty::orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $faculty
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching faculty: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch faculty members',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created faculty member
     */
    public function store(Request $request)
    {
        try {
            // Validation rules
            $validator = Validator::make($request->all(), [
                'faculty_id' => 'required|string|unique:faculty,faculty_id|max:50',
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|unique:faculty,email|max:255',
                'phone' => 'nullable|string|max:20',
                'department' => 'required|string|max:255',
                'position' => 'required|string|max:255',
                'course_id' => 'nullable|exists:courses,id',
                'course_name' => 'nullable|string|max:255',
                'hire_date' => 'nullable|date',
                'status' => 'nullable|in:active,inactive,on_leave',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Create faculty member
            $faculty = Faculty::create([
                'faculty_id' => $request->faculty_id,
                'full_name' => $request->full_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'department' => $request->department,
                'position' => $request->position,
                'course_id' => $request->course_id,
                'course_name' => $request->course_name,
                'hire_date' => $request->hire_date,
                'status' => $request->status ?? 'active',
            ]);

            // If course is assigned, update the course with instructor details
            if ($request->course_id) {
                $course = Course::find($request->course_id);
                if ($course) {
                    $course->update([
                        'instructor_id' => $faculty->id,
                        'instructor_name' => $faculty->full_name,
                        'instructor_email' => $faculty->email,
                        'instructor_faculty_id' => $faculty->faculty_id,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Faculty member created successfully',
                'data' => $faculty
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating faculty: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create faculty member',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified faculty member
     */
    public function show($id)
    {
        try {
            $faculty = Faculty::findOrFail($id);
            
            // Get assigned course details if exists
            $courseDetails = null;
            if ($faculty->course_id) {
                $courseDetails = Course::find($faculty->course_id);
            }

            return response()->json([
                'success' => true,
                'data' => $faculty,
                'course_details' => $courseDetails
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching faculty: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Faculty member not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified faculty member
     */
    public function update(Request $request, $id)
    {
        try {
            $faculty = Faculty::findOrFail($id);

            // Validation rules (email and faculty_id unique except for current record)
            $validator = Validator::make($request->all(), [
                'faculty_id' => 'sometimes|required|string|max:50|unique:faculty,faculty_id,' . $id,
                'full_name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|max:255|unique:faculty,email,' . $id,
                'phone' => 'nullable|string|max:20',
                'department' => 'sometimes|required|string|max:255',
                'position' => 'sometimes|required|string|max:255',
                'course_id' => 'nullable|exists:courses,id',
                'course_name' => 'nullable|string|max:255',
                'hire_date' => 'nullable|date',
                'status' => 'nullable|in:active,inactive,on_leave',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Store old course_id before updating
            $oldCourseId = $faculty->course_id;
            $newCourseId = $request->course_id;

            // Update faculty member
            $faculty->update($request->only([
                'faculty_id',
                'full_name',
                'email',
                'phone',
                'department',
                'position',
                'course_id',
                'course_name',
                'hire_date',
                'status'
            ]));

            // Handle course assignment changes
            if ($newCourseId !== $oldCourseId) {
                // Clear old course assignment if it exists
                if ($oldCourseId) {
                    $oldCourse = Course::find($oldCourseId);
                    if ($oldCourse) {
                        $oldCourse->update([
                            'instructor_id' => null,
                            'instructor_name' => null,
                            'instructor_email' => null,
                            'instructor_faculty_id' => null,
                        ]);
                    }
                }

                // Assign new course if provided
                if ($newCourseId) {
                    $newCourse = Course::find($newCourseId);
                    if ($newCourse) {
                        $newCourse->update([
                            'instructor_id' => $faculty->id,
                            'instructor_name' => $faculty->full_name,
                            'instructor_email' => $faculty->email,
                            'instructor_faculty_id' => $faculty->faculty_id,
                        ]);
                    }
                }
            } elseif ($newCourseId) {
                // Update course instructor details if they changed (name, email, etc.)
                $course = Course::find($newCourseId);
                if ($course) {
                    $course->update([
                        'instructor_name' => $faculty->full_name,
                        'instructor_email' => $faculty->email,
                        'instructor_faculty_id' => $faculty->faculty_id,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Faculty member updated successfully',
                'data' => $faculty
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating faculty: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update faculty member',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified faculty member
     */
    public function destroy($id)
    {
        try {
            $faculty = Faculty::findOrFail($id);

            DB::beginTransaction();

            // Clear course assignment if exists
            if ($faculty->course_id) {
                $course = Course::find($faculty->course_id);
                if ($course) {
                    $course->update([
                        'instructor_id' => null,
                        'instructor_name' => null,
                        'instructor_email' => null,
                        'instructor_faculty_id' => null,
                    ]);
                }
            }

            $faculty->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Faculty member deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting faculty: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete faculty member',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get faculty members by department
     */
    public function getByDepartment($department)
    {
        try {
            $faculty = Faculty::where('department', $department)
                ->where('status', 'active')
                ->orderBy('full_name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $faculty
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching faculty by department: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch faculty members',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get faculty statistics
     */
    public function statistics()
    {
        try {
            $stats = [
                'total' => Faculty::count(),
                'active' => Faculty::where('status', 'active')->count(),
                'inactive' => Faculty::where('status', 'inactive')->count(),
                'on_leave' => Faculty::where('status', 'on_leave')->count(),
                'departments' => Faculty::distinct('department')->count('department'),
                'with_courses' => Faculty::whereNotNull('course_id')->count(),
                'without_courses' => Faculty::whereNull('course_id')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching faculty statistics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search faculty members
     */
    public function search(Request $request)
    {
        try {
            $query = Faculty::query();

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                      ->orWhere('faculty_id', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('department', 'like', "%{$search}%")
                      ->orWhere('course_name', 'like', "%{$search}%");
                });
            }

            if ($request->has('department')) {
                $query->where('department', $request->department);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('position')) {
                $query->where('position', $request->position);
            }

            $faculty = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $faculty
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error searching faculty: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to search faculty members',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}