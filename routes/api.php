<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\LoginController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes handle your application's API endpoints. Prefixed with /api.
|
*/

// Profile Management Routes
Route::get('/profiles', [ProfileController::class, 'index']);
Route::post('/profiles', [ProfileController::class, 'store']);
Route::put('/profiles/{id}', [ProfileController::class, 'update']);
Route::delete('/profiles/{id}', [ProfileController::class, 'destroy']);

// Dashboard Data Route
Route::get('/dashboard-data', [DashboardController::class, 'getDashboardData']);

// Login Routes
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

// Authenticated user info (Sanctum)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Users API Routes - Complete CRUD Operations
Route::prefix('users')->group(function () {
    Route::get('/', [UsersController::class, 'getUsers']);
    Route::post('/', [UsersController::class, 'store']);
    Route::get('/{id}', [UsersController::class, 'show']);
    Route::put('/{id}', [UsersController::class, 'update']);
    Route::patch('/{id}', [UsersController::class, 'update']);
    Route::delete('/{id}', [UsersController::class, 'destroy']);
});

// Students API Routes - Complete CRUD Operations
Route::apiResource('students', StudentController::class);

Route::prefix('students')->group(function () {
    Route::get('/', [StudentsController::class, 'getStudents']);
    Route::post('/', [StudentsController::class, 'store']);
    Route::get('/{id}', [StudentsController::class, 'show']);
    Route::put('/{id}', [StudentsController::class, 'update']);
    Route::patch('/{id}', [StudentsController::class, 'update']);
    Route::delete('/{id}', [StudentsController::class, 'destroy']);
});

// Fallback for undefined API routes
Route::fallback(function () {
    return response()->json([
        'message' => 'API endpoint not found'
    ], 404);
});
