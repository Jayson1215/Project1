<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\StudentsController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\CoursesController;
use App\Http\Controllers\AcademicYearsController;
use App\Http\Controllers\DepartmentsController;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| These routes handle page rendering (Blade views).
| API routes should go in routes/api.php instead.
|
*/

// Landing page
Route::get('/', function () {
    return view('welcome');
})->name('home');

// Login page
Route::get('/login', function () {
    return view('login'); 
})->name('login');

// Logout route
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Dashboard (Main Admin Dashboard)
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

// Users Management Page
Route::get('/dashboard/users', [UsersController::class, 'index'])->name('users.index');

// Students Management Page
Route::get('/dashboard/students', [StudentsController::class, 'index'])->name('students.index');

// Faculty Management Page
Route::get('/dashboard/faculty', [FacultyController::class, 'index'])->name('faculty.index');

// Courses Management Page
Route::get('/dashboard/courses', [CoursesController::class, 'index'])->name('courses.index');

// Academic Years Management Page
Route::get('/dashboard/academic-years', [AcademicYearsController::class, 'index'])->name('academic-years.index');

// Departments Management Page
Route::get('/dashboard/departments', [DepartmentsController::class, 'index'])->name('departments.index');

// Settings Page
Route::get('/dashboard/settings', function () {
    return view('settings');
})->name('settings');

// Help & Support Page
Route::get('/dashboard/help', function () {
    return view('help');
})->name('help');

// Catch-all route for SPA (handles frontend routing)
// This MUST be last to avoid overriding other routes
Route::get('/{any}', function () {
    return view('dashboard');
})->where('any', '^(?!api).*$')->name('catch-all');

Route::get('/students', [StudentsController::class, 'index'])->name('students');