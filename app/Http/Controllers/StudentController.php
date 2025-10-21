<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    /**
     * Display the Students page (React/Blade)
     */
    public function index()
    {
        return view('students'); // ✅ now loads your students.blade.php (design)
    }

    /**
     * GET /api/students
     * Return all students as JSON for API
     */
    public function getStudents()
    {
        $students = Student::all();
        return response()->json($students, 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|string|unique:students,student_id',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:students,email',
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string|max:15',
            'department' => 'required|string|max:100',
            'year_level' => 'required|integer|in:1,2,3,4',
            'status' => 'required|in:active,inactive',
            'enrollment_date' => 'required|date',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string|max:255',
            'guardian_name' => 'nullable|string|max:255',
            'guardian_phone' => 'nullable|string|max:15',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()]);
        }

        $data = $request->only([
            'student_id','full_name','email','phone','department','year_level',
            'status','enrollment_date','date_of_birth','address','guardian_name','guardian_phone'
        ]);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->input('password'));
        }

        $student = Student::create($data);
        return response()->json(['status' => 'success', 'message' => 'Student added successfully.', 'data' => $student]);
    }

    public function show($id)
    {
        $student = Student::find($id);
        return $student ? response()->json($student, 200)
                        : response()->json(['message' => 'Student not found'], 404);
    }

    public function update(Request $request, $id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'student_id' => 'required|string|unique:students,student_id,' . $id,
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:students,email,' . $id,
            'department' => 'required|string|max:100',
            'year_level' => 'required|integer|in:1,2,3,4',
            'status' => 'required|in:active,inactive',
            'enrollment_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $student->update($request->all());
        return response()->json($student, 200);
    }

    public function destroy($id)
    {
        $student = Student::find($id);

        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        $student->delete();
        return response()->json(['message' => 'Student deleted successfully'], 200);
    }
}
