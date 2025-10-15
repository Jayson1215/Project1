<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Faculty;
use Illuminate\Validation\Rule;

class FacultyController extends Controller
{
    /**
     * Display the faculty management page
     */
    public function index()
    {
        return view('faculty');
    }

    /**
     * Get all faculty members (API)
     */
    public function getFaculty()
    {
        $faculty = Faculty::with(['user', 'department'])->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $faculty
        ]);
    }

    /**
     * Store a new faculty member
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'faculty_id' => 'required|string|unique:faculty,faculty_id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:faculty,email',
            'phone' => 'nullable|string|max:20',
            'department_id' => 'required|exists:departments,id',
            'position' => 'required|string|max:100',
            'specialization' => 'nullable|string|max:255',
            'hire_date' => 'required|date',
            'status' => 'required|in:active,inactive,on_leave'
        ]);

        $faculty = Faculty::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Faculty member created successfully',
            'data' => $faculty
        ], 201);
    }

    /**
     * Display the specified faculty member
     */
    public function show($id)
    {
        $faculty = Faculty::with(['user', 'department'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $faculty
        ]);
    }

    /**
     * Update the specified faculty member
     */
    public function update(Request $request, $id)
    {
        $faculty = Faculty::findOrFail($id);

        $validated = $request->validate([
            'faculty_id' => ['sometimes', 'required', 'string', Rule::unique('faculty')->ignore($faculty->id)],
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('faculty')->ignore($faculty->id)],
            'phone' => 'sometimes|nullable|string|max:20',
            'department_id' => 'sometimes|required|exists:departments,id',
            'position' => 'sometimes|required|string|max:100',
            'specialization' => 'sometimes|nullable|string|max:255',
            'hire_date' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:active,inactive,on_leave'
        ]);

        $faculty->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Faculty member updated successfully',
            'data' => $faculty
        ]);
    }

    /**
     * Remove the specified faculty member
     */
    public function destroy($id)
    {
        $faculty = Faculty::findOrFail($id);
        $faculty->delete();

        return response()->json([
            'success' => true,
            'message' => 'Faculty member deleted successfully'
        ]);
    }
}
