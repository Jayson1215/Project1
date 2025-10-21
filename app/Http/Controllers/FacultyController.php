<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Faculty;
use Illuminate\Validation\Rule;

class FacultyController extends Controller
{
    /**
     * Show the Faculty page (Blade)
     */
    public function index()
    {
        return view('faculty');
    }

    /**
     * GET /api/faculty
     * Return all faculty members
     */
    public function getFaculty()
    {
        $faculty = Faculty::orderBy('created_at', 'desc')->get();
        return response()->json($faculty);
    }

    /**
     * POST /api/faculty
     * Create a new faculty record
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'faculty_id' => 'required|string|unique:faculty,faculty_id',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:faculty,email',
            'phone' => 'nullable|string|max:20',
            'department' => 'required|string|max:255',
            'position' => 'required|string|max:100',
            'specialization' => 'nullable|string|max:255',
            'employment_type' => 'required|string|max:50',
            'status' => 'required|string|max:50',
            'hire_date' => 'required|date',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string|max:500',
            'emergency_contact' => 'nullable|string|max:255',
            'emergency_phone' => 'nullable|string|max:20',
            'qualifications' => 'nullable|string|max:255',
            'years_of_experience' => 'nullable|integer|min:0',
        ]);

        $faculty = Faculty::create($validated);

        return response()->json($faculty, 201);
    }

    /**
     * GET /api/faculty/{id}
     */
    public function show($id)
    {
        $faculty = Faculty::findOrFail($id);
        return response()->json($faculty);
    }

    /**
     * PUT /api/faculty/{id}
     * Update existing faculty member
     */
    public function update(Request $request, $id)
    {
        $faculty = Faculty::findOrFail($id);

        $validated = $request->validate([
            'faculty_id' => ['sometimes', 'required', 'string', Rule::unique('faculty')->ignore($faculty->id)],
            'full_name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('faculty')->ignore($faculty->id)],
            'phone' => 'sometimes|nullable|string|max:20',
            'department' => 'sometimes|required|string|max:255',
            'position' => 'sometimes|required|string|max:100',
            'specialization' => 'sometimes|nullable|string|max:255',
            'employment_type' => 'sometimes|required|string|max:50',
            'status' => 'sometimes|required|string|max:50',
            'hire_date' => 'sometimes|required|date',
            'date_of_birth' => 'sometimes|nullable|date',
            'address' => 'sometimes|nullable|string|max:500',
            'emergency_contact' => 'sometimes|nullable|string|max:255',
            'emergency_phone' => 'sometimes|nullable|string|max:20',
            'qualifications' => 'sometimes|nullable|string|max:255',
            'years_of_experience' => 'sometimes|nullable|integer|min:0',
        ]);

        $faculty->update($validated);

        return response()->json($faculty);
    }

    /**
     * DELETE /api/faculty/{id}
     */
    public function destroy($id)
    {
        $faculty = Faculty::findOrFail($id);
        $faculty->delete();

        return response()->json(['message' => 'Faculty member deleted successfully']);
    }
}
