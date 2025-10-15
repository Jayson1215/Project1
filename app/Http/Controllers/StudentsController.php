<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StudentController extends Controller
{
    // Return the view for web route
    public function index()
    {
        return view('dashboard');
    }

    // API: Get all students
    public function getStudents()
    {
        try {
            $students = Student::select(
                'id',
                'student_id',
                'full_name',
                'email',
                'phone',
                'department',
                'year_level',
                'status',
                'enrollment_date',
                'date_of_birth',
                'address',
                'guardian_name',
                'guardian_phone',
                'created_at',
                'updated_at'
            )
            ->orderBy('created_at', 'desc')
            ->get();

            return response()->json($students, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching students',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // API: Store a new student
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'student_id' => 'required|string|unique:students,student_id',
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|unique:students,email',
                'phone' => 'nullable|string|max:20',
                'department' => 'required|string|max:100',
                'year_level' => 'required|integer|in:1,2,3,4',
                'status' => 'required|in:active,inactive',
                'enrollment_date' => 'required|date',
                'date_of_birth' => 'nullable|date',
                'address' => 'nullable|string',
                'guardian_name' => 'nullable|string|max:255',
                'guardian_phone' => 'nullable|string|max:20',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $student = Student::create($request->all());

            return response()->json([
                'message' => 'Student created successfully',
                'student' => $student
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // API: Update a student
    public function update(Request $request, $id)
    {
        try {
            $student = Student::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'student_id' => 'required|string|unique:students,student_id,' . $id,
                'full_name' => 'required|string|max:255',
                'email' => 'required|email|unique:students,email,' . $id,
                'phone' => 'nullable|string|max:20',
                'department' => 'required|string|max:100',
                'year_level' => 'required|integer|in:1,2,3,4',
                'status' => 'required|in:active,inactive',
                'enrollment_date' => 'required|date',
                'date_of_birth' => 'nullable|date',
                'address' => 'nullable|string',
                'guardian_name' => 'nullable|string|max:255',
                'guardian_phone' => 'nullable|string|max:20',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $student->update($request->all());

            return response()->json([
                'message' => 'Student updated successfully',
                'student' => $student
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // API: Delete a student
    public function destroy($id)
    {
        try {
            $student = Student::findOrFail($id);
            $student->delete();

            return response()->json([
                'message' => 'Student deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting student',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}