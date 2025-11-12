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
        try {
            \Log::info('getDepartments called');
            
            $departments = Department::select('departments.*')
                ->orderBy('name', 'asc')
                ->get();
            
            \Log::info('Departments fetched', ['count' => $departments->count()]);
            
            return response()->json([
                'success' => true,
                'data' => $departments
            ]);
        } catch (\Exception $e) {
            \Log::error('Get departments error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch departments',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Store a new department
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'code' => 'required|string|unique:departments,code',
                'name' => 'required|string|max:255|unique:departments,name',
                'description' => 'nullable|string',
                'head_faculty_id' => 'nullable|exists:faculty,id',
                'building' => 'nullable|string|max:100',
                'contact_email' => 'nullable|email',
                'contact_phone' => 'nullable|string|max:20',
                'status' => 'required|in:Active,Inactive'
            ]);

            $department = Department::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Department created successfully',
                'data' => $department
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Store department error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create department',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Show a single department
     */
    public function show($id)
    {
        try {
            $department = Department::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $department
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Show department error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch department',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update an existing department
     */
    public function update(Request $request, $id)
    {
        try {
            $department = Department::findOrFail($id);

            $validated = $request->validate([
                'code' => ['sometimes', 'required', 'string', Rule::unique('departments')->ignore($department->id)],
                'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('departments')->ignore($department->id)],
                'description' => 'sometimes|nullable|string',
                'head_faculty_id' => 'sometimes|nullable|exists:faculty,id',
                'building' => 'sometimes|nullable|string|max:100',
                'contact_email' => 'sometimes|nullable|email',
                'contact_phone' => 'sometimes|nullable|string|max:20',
                'status' => 'sometimes|required|in:Active,Inactive'
            ]);

            $department->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Department updated successfully',
                'data' => $department
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Update department error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update department',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Delete a department
     */
    public function destroy($id)
    {
        try {
            $department = Department::findOrFail($id);

            $department->delete();

            return response()->json([
                'success' => true,
                'message' => 'Department deleted successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        } catch (\Exception $e) {
            \Log::error('Delete department error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete department',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Export departments as CSV
     */
    public function export()
    {
        try {
            $departments = Department::all();

            $csv = "Code,Name,Description,Building,Email,Phone,Status\n";

            foreach ($departments as $dept) {
                $csv .= '"' . implode('","', [
                    $dept->code ?? '',
                    $dept->name ?? '',
                    str_replace('"', '""', $dept->description ?? ''),
                    $dept->building ?? '',
                    $dept->contact_email ?? '',
                    $dept->contact_phone ?? '',
                    $dept->status ?? ''
                ]) . "\"\n";
            }

            return response($csv)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', 'attachment; filename="departments_' . date('Y-m-d_His') . '.csv"');
        } catch (\Exception $e) {
            \Log::error('Export departments error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to export departments',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}