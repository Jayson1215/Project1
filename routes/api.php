<?php
// routes/api.php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ==============================
// Controllers
// ==============================
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\CoursesController;
use App\Http\Controllers\DepartmentsController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\AcademicYearsController;
use App\Http\Controllers\PublicUserController;

// ==============================
// Models for quick dashboard stats
// ==============================
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Course;
use App\Models\Department;
use App\Models\AcademicYear;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| All routes here are prefixed with /api by default.
|
*/

// ==============================
// Authentication Routes
// ==============================
Route::post('/login', [LoginController::class, 'login']);

Route::post('/login-demo', function (Request $request) {
    $credentials = $request->only(['username', 'password']);

    if ($credentials['username'] === 'admin' && $credentials['password'] === 'admin123') {
        return response()->json([
            'success' => true,
            'user' => ['name' => 'System Administrator', 'role' => 'admin']
        ]);
    }

    return response()->json([
        'success' => false,
        'message' => 'Invalid credentials'
    ], 401);
});

// ==============================
// Authenticated User
// ==============================
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// ==============================
// Profile Management
// ==============================
Route::prefix('profiles')->group(function () {
    Route::get('/', [ProfileController::class, 'index']);
    Route::post('/', [ProfileController::class, 'store']);
    Route::put('/{id}', [ProfileController::class, 'update']);
    Route::delete('/{id}', [ProfileController::class, 'destroy']);
});

// ==============================
// Dashboard Data
// ==============================
Route::get('/dashboard-data', [DashboardController::class, 'getDashboardData']);

// ==============================
// Users API (CRUD)
// ==============================
Route::prefix('users')->group(function () {
    Route::get('/', [UsersController::class, 'getUsers']);
    Route::post('/', [UsersController::class, 'store']);
    Route::get('/{id}', [UsersController::class, 'show']);
    Route::put('/{id}', [UsersController::class, 'update']);
    Route::delete('/{id}', [UsersController::class, 'destroy']);
});

// ==============================
// Students API (CRUD)
// ==============================
Route::prefix('students')->group(function () {
    Route::get('/by-academic-year/{academicYear}', [StudentController::class, 'getStudentsByAcademicYear']);
    Route::get('/', [StudentController::class, 'getStudents']);
    Route::post('/', [StudentController::class, 'store']);
    Route::get('/{id}', [StudentController::class, 'show']);
    Route::put('/{id}', [StudentController::class, 'update']);
    Route::delete('/{id}', [StudentController::class, 'destroy']);
});

// ==============================
// Faculty API (CRUD)
// ==============================
Route::prefix('faculty')->group(function () {
    Route::get('/', [FacultyController::class, 'getFaculty']);
    Route::post('/', [FacultyController::class, 'store']);
    Route::get('/{id}', [FacultyController::class, 'show']);
    Route::put('/{id}', [FacultyController::class, 'update']);
    Route::delete('/{id}', [FacultyController::class, 'destroy']);
});

// ==============================
// Courses API (CRUD)
// ==============================
Route::prefix('courses')->group(function () {
    Route::get('/', [CoursesController::class, 'getCourses']);
    Route::post('/', [CoursesController::class, 'store']);
    Route::get('/{id}', [CoursesController::class, 'show']);
    Route::put('/{id}', [CoursesController::class, 'update']);
    Route::delete('/{id}', [CoursesController::class, 'destroy']);
});

// ==============================
// Departments API (CRUD + Export)
// ==============================
Route::prefix('departments')->group(function () {
    Route::get('/export', [DepartmentsController::class, 'export']); // Must be before /{id}
    Route::get('/', [DepartmentsController::class, 'getDepartments']);
    Route::post('/', [DepartmentsController::class, 'store']);
    Route::get('/{id}', [DepartmentsController::class, 'show']);
    Route::put('/{id}', [DepartmentsController::class, 'update']);
    Route::delete('/{id}', [DepartmentsController::class, 'destroy']);
});

// ==============================
// Academic Years API (CRUD + Export)
// ==============================
Route::prefix('AcademicYears')->group(function () {
    Route::get('/enrollment-stats', [AcademicYearsController::class, 'getEnrollmentStats']);
    Route::get('/export', [AcademicYearsController::class, 'export']);
    Route::get('/current', [AcademicYearsController::class, 'getCurrent']);
    Route::get('/stats', [AcademicYearsController::class, 'getStats']);
    Route::get('/', [AcademicYearsController::class, 'getAcademicYears']);
    Route::post('/', [AcademicYearsController::class, 'store']);
    Route::get('/{id}', [AcademicYearsController::class, 'show']);
    Route::put('/{id}', [AcademicYearsController::class, 'update']);
    Route::delete('/{id}', [AcademicYearsController::class, 'destroy']);
    Route::post('/{id}/set-current', [AcademicYearsController::class, 'setCurrent']);
});

// ==============================
// Dashboard Summary Stats
// ==============================
Route::get('/dashboard/stats', function () {
    try {
        return response()->json([
            'totalStudents' => Student::count(),
            'totalFaculty' => Faculty::count(),
            'totalCourses' => Course::count(),
            'totalDepartments' => Department::count(),
            'totalAcademicYears' => AcademicYear::count(),
            'currentAcademicYear' => AcademicYear::where('is_current', true)->first(),
        ]);
    } catch (\Exception $e) {
        \Log::error('Dashboard stats error: ' . $e->getMessage());
        return response()->json([
            'error' => 'Failed to load dashboard stats',
            'debug' => config('app.debug') ? $e->getMessage() : null,
        ], 500);
    }
});

// ==============================
// Dashboard Department Stats
// ==============================
Route::get('/dashboard/department-stats', function () {
    try {
        $departments = Department::select('id', 'name')
            ->withCount(['students', 'faculty'])
            ->get()
            ->map(fn($dept) => [
                'name' => $dept->name,
                'students' => $dept->students_count ?? 0,
                'faculty' => $dept->faculty_count ?? 0,
            ]);

        return response()->json($departments);
    } catch (\Exception $e) {
        \Log::error('Department stats error: ' . $e->getMessage());
        return response()->json([]);
    }
});

// ==============================
// Dashboard Course Stats
// ==============================
Route::get('/dashboard/course-stats', function () {
    try {
        $courses = Course::select('id', 'code', 'name')
            ->withCount(['students'])
            ->limit(10)
            ->get()
            ->map(fn($course) => [
                'name' => $course->code ?? $course->name,
                'students' => $course->students_count ?? 0,
            ]);

        return response()->json($courses);
    } catch (\Exception $e) {
        \Log::error('Course stats error: ' . $e->getMessage());
        return response()->json([]);
    }
});

// ==============================
// Test Routes (for debugging)
// ==============================
Route::get('/test-departments', function () {
    try {
        $count = Department::count();
        $departments = Department::all();

        return response()->json([
            'success' => true,
            'message' => 'Connection OK',
            'count' => $count,
            'departments' => $departments,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => config('app.debug') ? $e->getTraceAsString() : 'Enable debug mode to view trace'
        ], 500);
    }
});

Route::get('/test-academic-years', function () {
    try {
        $count = AcademicYear::count();
        $academicYears = AcademicYear::all();

        return response()->json([
            'success' => true,
            'message' => 'Connection OK',
            'count' => $count,
            'academic_years' => $academicYears,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => config('app.debug') ? $e->getTraceAsString() : 'Enable debug mode to view trace'
        ], 500);
    }
});

// ==============================
// Public Routes
// ==============================
Route::post('/public/users/set-last-login', [PublicUserController::class, 'setLastLogin']);

// ==============================
// Fallback Route (Invalid API)
// ==============================
Route::fallback(function () {
    return response()->json([
        'message' => 'API endpoint not found',
        'requested_url' => request()->fullUrl(),
    ], 404);
});
