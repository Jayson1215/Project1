<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\CoursesController;
use App\Http\Controllers\AcademicYearsController;
use App\Http\Controllers\DepartmentsController;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

// Landing page
Route::get('/', function () {
    return view('welcome');
})->name('home');

// Login page
Route::get('/login', function () {
    return view('login');
})->name('login');

// Logout
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

/*
|--------------------------------------------------------------------------
| Dashboard & Main Pages (View Routes)
|--------------------------------------------------------------------------
| These routes return Blade views with React components
|
*/

// Dashboard
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

// Users Management
Route::get('/users', [UsersController::class, 'index'])->name('users.index');
Route::get('/dashboard/users', [UsersController::class, 'index'])->name('users.dashboard');

// Students Management
Route::get('/students', [StudentController::class, 'index'])->name('students.index');
Route::get('/dashboard/students', [StudentController::class, 'index'])->name('students.dashboard');

// Faculty Management
Route::get('/faculty', [FacultyController::class, 'index'])->name('faculty.index');
Route::get('/dashboard/faculty', [FacultyController::class, 'index'])->name('faculty.dashboard');

// Courses Management
Route::get('/courses', [CoursesController::class, 'index'])->name('courses.index');
Route::get('/dashboard/courses', [CoursesController::class, 'index'])->name('courses.dashboard');

// Academic Years Management
Route::get('/academicyears', [AcademicYearsController::class, 'index'])->name('academicyears.index');
Route::get('/dashboard/academicyears', [AcademicYearsController::class, 'index'])->name('academicyears.dashboard');

// Departments Management
Route::get('/departments', [DepartmentsController::class, 'index'])->name('departments.index');
Route::get('/dashboard/departments', [DepartmentsController::class, 'index'])->name('departments.dashboard');

// Settings
Route::get('/settings', function () {
    return view('settings');
})->name('settings');
Route::get('/dashboard/settings', function () {
    return view('settings');
})->name('settings.dashboard');

// Help
Route::get('/help', function () {
    return view('help');
})->name('help');
Route::get('/dashboard/help', function () {
    return view('help');
})->name('help.dashboard');

/*
|--------------------------------------------------------------------------
| API Routes - Faculty
|--------------------------------------------------------------------------
| These routes return JSON data for AJAX requests
|
*/

Route::prefix('api')->group(function () {
    
    // Faculty API
    Route::get('/faculty', [FacultyController::class, 'getFaculty']);
    Route::post('/faculty', [FacultyController::class, 'store']);
    Route::get('/faculty/statistics', [FacultyController::class, 'statistics']);
    Route::get('/faculty/search', [FacultyController::class, 'search']);
    Route::get('/faculty/department/{department}', [FacultyController::class, 'getByDepartment']);
    Route::get('/faculty/{id}', [FacultyController::class, 'show']);
    Route::put('/faculty/{id}', [FacultyController::class, 'update']);
    Route::delete('/faculty/{id}', [FacultyController::class, 'destroy']);
    
    // Courses API
    Route::get('/courses', [CoursesController::class, 'getCourses']);
    Route::post('/courses', [CoursesController::class, 'store']);
    Route::get('/courses/statistics', [CoursesController::class, 'statistics']);
    Route::get('/courses/search', [CoursesController::class, 'search']);
    Route::get('/courses/department/{departmentId}', [CoursesController::class, 'getCoursesByDepartment']);
    Route::get('/courses/{id}', [CoursesController::class, 'show']);
    Route::put('/courses/{id}', [CoursesController::class, 'update']);
    Route::delete('/courses/{id}', [CoursesController::class, 'destroy']);
    
    // Students API
    Route::get('/students', [StudentController::class, 'getStudents']);
    Route::post('/students', [StudentController::class, 'store']);
    Route::get('/students/{id}', [StudentController::class, 'show']);
    Route::put('/students/{id}', [StudentController::class, 'update']);
    Route::delete('/students/{id}', [StudentController::class, 'destroy']);
    
    // Users API
    Route::get('/users', [UsersController::class, 'getUsers']);
    Route::post('/users', [UsersController::class, 'store']);
    Route::get('/users/{id}', [UsersController::class, 'show']);
    Route::put('/users/{id}', [UsersController::class, 'update']);
    Route::delete('/users/{id}', [UsersController::class, 'destroy']);
    
    // Departments API
    Route::get('/departments', [DepartmentsController::class, 'getDepartments']);
    Route::post('/departments', [DepartmentsController::class, 'store']);
    Route::get('/departments/{id}', [DepartmentsController::class, 'show']);
    Route::put('/departments/{id}', [DepartmentsController::class, 'update']);
    Route::delete('/departments/{id}', [DepartmentsController::class, 'destroy']);
    
    // Academic Years API
    Route::get('/academicyears', [AcademicYearsController::class, 'getAcademicYears']);
    Route::post('/academicyears', [AcademicYearsController::class, 'store']);
    Route::get('/academicyears/{id}', [AcademicYearsController::class, 'show']);
    Route::put('/academicyears/{id}', [AcademicYearsController::class, 'update']);
    Route::delete('/academicyears/{id}', [AcademicYearsController::class, 'destroy']);
    
    // Dashboard API
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
});

 Route::get('/{any}', function () {
    return view('dashboard');
})->where('any', '^(?!api).*$')->name('catch-all');