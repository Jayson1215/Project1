<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Department;
use Illuminate\Validation\Rule;

class DepartmentsController extends Controller
{
    /**
     * Display the departments management page
     */
    public function index()
    {
        return view('departments');
    }

    /**
     * Get all departments (API)
     */
    public function getDepartments()
    {
        $departments = Department::withCount(['students', 'faculty', 'courses'])
            ->orderBy('name', 'asc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $departments
        ]);
    }

    /**
     * Store a new department
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:departments,code',
            'name' => 'required|string|max:255|unique:departments,name',
            'description' => 'nullable|string',
            'head_faculty_id' => 'nullable|exists:faculty,id',
            'building' => 'nullable|string|max:100',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string|max:20',
            'status' => 'required|in:active,inactive'
        ]);

        $department = Department::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Department created successfully',
            'data' => $department
        ], 201);
    }

    /**
     * Display the specified department
     */
    public function show($id)
    {
        $department = Department::withCount(['students', 'faculty', 'courses'])
            ->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $department
        ]);
    }

    /**
     * Update the specified department
     */
    public function update(Request $request, $id)
    {
        $department = Department::findOrFail($id);

        $validated = $request->validate([
            'code' => ['sometimes', 'required', 'string', Rule::unique('departments')->ignore($department->id)],
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('departments')->ignore($department->id)],
            'description' => 'sometimes|nullable|string',
            'head_faculty_id' => 'sometimes|nullable|exists:faculty,id',
            'building' => 'sometimes|nullable|string|max:100',
            'contact_email' => 'sometimes|nullable|email',
            'contact_phone' => 'sometimes|nullable|string|max:20',
            'status' => 'sometimes|required|in:active,inactive'
        ]);

        $department->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Department updated successfully',
            'data' => $department
        ]);
    }

    /**
     * Remove the specified department
     */
    public function destroy($id)
    {
        $department = Department::findOrFail($id);
        
        // Check if department has students or faculty
        if ($department->students()->count() > 0 || $department->faculty()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete department with active students or faculty'
            ], 422);
        }
        
        $department->delete();

        return response()->json([
            'success' => true,
            'message' => 'Department deleted successfully'
        ]);
    }
}
