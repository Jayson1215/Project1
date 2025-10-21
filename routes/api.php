<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\CoursesController;
use App\Http\Controllers\DepartmentsController;
use App\Http\Controllers\LoginController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| All routes prefixed with /api
|
*/

// ==============================
// Profile Management Routes
// ==============================
Route::get('/profiles', [ProfileController::class, 'index']);
Route::post('/profiles', [ProfileController::class, 'store']);
Route::put('/profiles/{id}', [ProfileController::class, 'update']);
Route::delete('/profiles/{id}', [ProfileController::class, 'destroy']);

// ==============================
// Dashboard Data Route
// ==============================
Route::get('/dashboard-data', [DashboardController::class, 'getDashboardData']);

// ==============================
// Login Routes
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
// Authenticated user info
// ==============================
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

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
// Departments API (CRUD)
// ==============================
Route::prefix('departments')->group(function () {
    Route::get('/', [DepartmentsController::class, 'getDepartments']);
    Route::post('/', [DepartmentsController::class, 'store']);
    Route::get('/{id}', [DepartmentsController::class, 'show']);
    Route::put('/{id}', [DepartmentsController::class, 'update']);
    Route::delete('/{id}', [DepartmentsController::class, 'destroy']);
});

// ==============================
// Dashboard Summary (Stats)
// ==============================
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Course;
use App\Models\Department;

Route::get('/dashboard/stats', function () {
    return response()->json([
        'totalStudents' => Student::count(),
        'totalFaculty' => Faculty::count(),
        'totalCourses' => Course::count(),
        'totalDepartments' => Department::count(),
    ]);
});

// ==============================
// Fallback for undefined API routes
// ==============================
Route::fallback(function () {
    return response()->json([
        'message' => 'API endpoint not found'
    ], 404);
});
