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
        try {
            $academicYears = AcademicYear::orderBy('start_date', 'desc')->get();
            
            // Transform field names to camelCase for frontend
            $transformed = $academicYears->map(function($year) {
                return [
                    'id' => $year->id,
                    'yearName' => $year->year_name,
                    'startDate' => $year->start_date ? $year->start_date->format('Y-m-d') : null,
                    'endDate' => $year->end_date ? $year->end_date->format('Y-m-d') : null,
                    'semesters' => $year->semesters ?? 2,
                    'currentSemester' => $year->current_semester,
                    'totalStudents' => $year->total_students ?? 0,
                    'status' => $year->status ?? 'upcoming',
                    'isCurrent' => $year->is_current ?? false,
                    'createdAt' => $year->created_at,
                    'updatedAt' => $year->updated_at,
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $transformed
            ]);
        } catch (\Exception $e) {
            \Log::error('Get academic years error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch academic years',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Store a new academic year
     */
    public function store(Request $request)
    {
        try {
            // Transform camelCase to snake_case
            $data = [
                'year_name' => $request->input('yearName'),
                'start_date' => $request->input('startDate'),
                'end_date' => $request->input('endDate'),
                'semesters' => $request->input('semesters', 2),
                'current_semester' => $request->input('currentSemester'),
                'total_students' => $request->input('totalStudents', 0),
                'status' => $request->input('status', 'upcoming'),
                'is_current' => $request->input('isCurrent', false),
            ];

            $validated = validator($data, [
                'year_name' => 'required|string|unique:academic_years,year_name',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'semesters' => 'nullable|integer|min:1|max:4',
                'current_semester' => 'nullable|string|max:100',
                'total_students' => 'nullable|integer|min:0',
                'is_current' => 'nullable|boolean',
                'status' => 'required|in:active,inactive,completed,upcoming'
            ])->validate();

            // If this is set as current, unset all others
            if ($validated['is_current'] ?? false) {
                AcademicYear::where('is_current', true)->update(['is_current' => false]);
            }

            $academicYear = AcademicYear::create($validated);

            // Transform response back to camelCase
            $transformed = [
                'id' => $academicYear->id,
                'yearName' => $academicYear->year_name,
                'startDate' => $academicYear->start_date ? $academicYear->start_date->format('Y-m-d') : null,
                'endDate' => $academicYear->end_date ? $academicYear->end_date->format('Y-m-d') : null,
                'semesters' => $academicYear->semesters,
                'currentSemester' => $academicYear->current_semester,
                'totalStudents' => $academicYear->total_students,
                'status' => $academicYear->status,
                'isCurrent' => $academicYear->is_current,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Academic year created successfully',
                'data' => $transformed
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Store academic year error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create academic year',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Display the specified academic year
     */
    public function show($id)
    {
        try {
            $academicYear = AcademicYear::findOrFail($id);
            
            // Transform to camelCase
            $transformed = [
                'id' => $academicYear->id,
                'yearName' => $academicYear->year_name,
                'startDate' => $academicYear->start_date ? $academicYear->start_date->format('Y-m-d') : null,
                'endDate' => $academicYear->end_date ? $academicYear->end_date->format('Y-m-d') : null,
                'semesters' => $academicYear->semesters,
                'currentSemester' => $academicYear->current_semester,
                'totalStudents' => $academicYear->total_students,
                'status' => $academicYear->status,
                'isCurrent' => $academicYear->is_current,
            ];
            
            return response()->json([
                'success' => true,
                'data' => $transformed
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Academic year not found'
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Show academic year error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch academic year',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update the specified academic year
     */
    public function update(Request $request, $id)
    {
        try {
            $academicYear = AcademicYear::findOrFail($id);

            // Transform camelCase to snake_case
            $data = array_filter([
                'year_name' => $request->input('yearName'),
                'start_date' => $request->input('startDate'),
                'end_date' => $request->input('endDate'),
                'semesters' => $request->input('semesters'),
                'current_semester' => $request->input('currentSemester'),
                'total_students' => $request->input('totalStudents'),
                'status' => $request->input('status'),
                'is_current' => $request->input('isCurrent'),
            ], function($value) {
                return $value !== null;
            });

            $validated = validator($data, [
                'year_name' => ['sometimes', 'required', 'string', Rule::unique('academic_years')->ignore($academicYear->id)],
                'start_date' => 'sometimes|required|date',
                'end_date' => 'sometimes|required|date|after:start_date',
                'semesters' => 'sometimes|nullable|integer|min:1|max:4',
                'current_semester' => 'sometimes|nullable|string|max:100',
                'total_students' => 'sometimes|nullable|integer|min:0',
                'is_current' => 'sometimes|nullable|boolean',
                'status' => 'sometimes|required|in:active,inactive,completed,upcoming'
            ])->validate();

            // If this is set as current, unset all others
            if (isset($validated['is_current']) && $validated['is_current']) {
                AcademicYear::where('id', '!=', $id)->update(['is_current' => false]);
            }

            $academicYear->update($validated);

            // Transform response back to camelCase
            $transformed = [
                'id' => $academicYear->id,
                'yearName' => $academicYear->year_name,
                'startDate' => $academicYear->start_date ? $academicYear->start_date->format('Y-m-d') : null,
                'endDate' => $academicYear->end_date ? $academicYear->end_date->format('Y-m-d') : null,
                'semesters' => $academicYear->semesters,
                'currentSemester' => $academicYear->current_semester,
                'totalStudents' => $academicYear->total_students,
                'status' => $academicYear->status,
                'isCurrent' => $academicYear->is_current,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Academic year updated successfully',
                'data' => $transformed
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Academic year not found'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Update academic year error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update academic year',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Remove the specified academic year
     */
    public function destroy($id)
    {
        try {
            $academicYear = AcademicYear::findOrFail($id);
            
            // Check if it's the current academic year
            if ($academicYear->is_current) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete the current academic year'
                ], 422);
            }
            
            $academicYear->delete();

            return response()->json([
                'success' => true,
                'message' => 'Academic year deleted successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Academic year not found'
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Delete academic year error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete academic year',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Export academic years to CSV
     */
    public function export()
    {
        try {
            $academicYears = AcademicYear::orderBy('start_date', 'desc')->get();
            
            $csv = "Year Name,Start Date,End Date,Semesters,Current Semester,Total Students,Is Current,Status\n";
            
            foreach ($academicYears as $year) {
                $csv .= '"' . implode('","', [
                    $year->year_name ?? '',
                    $year->start_date ? $year->start_date->format('Y-m-d') : '',
                    $year->end_date ? $year->end_date->format('Y-m-d') : '',
                    $year->semesters ?? '',
                    $year->current_semester ?? '',
                    $year->total_students ?? 0,
                    $year->is_current ? 'Yes' : 'No',
                    $year->status ?? ''
                ]) . "\"\n";
            }

            return response($csv)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="academic_years_' . date('Y-m-d_His') . '.csv"');
        } catch (\Exception $e) {
            \Log::error('Export academic years error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to export academic years',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get current academic year
     */
    public function getCurrent()
    {
        try {
            $current = AcademicYear::where('is_current', true)->first();
            
            if (!$current) {
                return response()->json([
                    'success' => false,
                    'message' => 'No current academic year set'
                ], 404);
            }

            $transformed = [
                'id' => $current->id,
                'yearName' => $current->year_name,
                'startDate' => $current->start_date ? $current->start_date->format('Y-m-d') : null,
                'endDate' => $current->end_date ? $current->end_date->format('Y-m-d') : null,
                'semesters' => $current->semesters,
                'currentSemester' => $current->current_semester,
                'totalStudents' => $current->total_students,
                'status' => $current->status,
                'isCurrent' => $current->is_current,
            ];
            
            return response()->json([
                'success' => true,
                'data' => $transformed
            ]);
        } catch (\Exception $e) {
            \Log::error('Get current academic year error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch current academic year'
            ], 500);
        }
    }

    /**
     * Set academic year as current
     */
    public function setCurrent($id)
    {
        try {
            $academicYear = AcademicYear::findOrFail($id);
            
            // Unset all other current years
            AcademicYear::where('id', '!=', $id)->update(['is_current' => false]);
            
            // Set this one as current
            $academicYear->update(['is_current' => true]);
            
            return response()->json([
                'success' => true,
                'message' => 'Academic year set as current successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Set current academic year error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to set current academic year'
            ], 500);
        }
    }

    /**
     * Get statistics
     */
    public function getStats()
    {
        try {
            $stats = [
                'total' => AcademicYear::count(),
                'active' => AcademicYear::where('status', 'active')->count(),
                'upcoming' => AcademicYear::where('status', 'upcoming')->count(),
                'completed' => AcademicYear::where('status', 'completed')->count(),
            ];
            
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            \Log::error('Get academic year stats error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics'
            ], 500);
            
        }
    }
}