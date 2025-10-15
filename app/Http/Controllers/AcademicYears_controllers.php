<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AcademicYear;
use Illuminate\Validation\Rule;

class AcademicYearsController extends Controller
{
    /**
     * Display the academic years management page
     */
    public function index()
    {
        return view('academic-years');
    }

    /**
     * Get all academic years (API)
     */
    public function getAcademicYears()
    {
        $academicYears = AcademicYear::orderBy('start_date', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $academicYears
        ]);
    }

    /**
     * Store a new academic year
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'year_name' => 'required|string|unique:academic_years,year_name',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'semester' => 'required|in:1,2,summer',
            'is_current' => 'boolean',
            'status' => 'required|in:active,inactive,completed'
        ]);

        // If this is set as current, unset all others
        if ($validated['is_current'] ?? false) {
            AcademicYear::where('is_current', true)->update(['is_current' => false]);
        }

        $academicYear = AcademicYear::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Academic year created successfully',
            'data' => $academicYear
        ], 201);
    }

    /**
     * Display the specified academic year
     */
    public function show($id)
    {
        $academicYear = AcademicYear::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $academicYear
        ]);
    }

    /**
     * Update the specified academic year
     */
    public function update(Request $request, $id)
    {
        $academicYear = AcademicYear::findOrFail($id);

        $validated = $request->validate([
            'year_name' => ['sometimes', 'required', 'string', Rule::unique('academic_years')->ignore($academicYear->id)],
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after:start_date',
            'semester' => 'sometimes|required|in:1,2,summer',
            'is_current' => 'sometimes|boolean',
            'status' => 'sometimes|required|in:active,inactive,completed'
        ]);

        // If this is set as current, unset all others
        if (isset($validated['is_current']) && $validated['is_current']) {
            AcademicYear::where('id', '!=', $id)->update(['is_current' => false]);
        }

        $academicYear->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Academic year updated successfully',
            'data' => $academicYear
        ]);
    }

    /**
     * Remove the specified academic year
     */
    public function destroy($id)
    {
        $academicYear = AcademicYear::findOrFail($id);
        $academicYear->delete();

        return response()->json([
            'success' => true,
            'message' => 'Academic year deleted successfully'
        ]);
    }
}
