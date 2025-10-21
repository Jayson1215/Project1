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
| Web Routes
|--------------------------------------------------------------------------
| Handles all page (Blade) routes.
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

// Logout
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Dashboard
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

// Users Management
Route::get('/dashboard/users', [UsersController::class, 'index'])->name('users.index');

// Students Management
Route::get('/dashboard/students', [StudentController::class, 'index'])->name('students.index');

// Faculty Management
Route::get('/dashboard/faculty', [FacultyController::class, 'index'])->name('faculty.index');

// Courses Management
Route::get('/dashboard/courses', [CoursesController::class, 'index'])->name('courses.index');

// Academic Years Management
Route::get('/dashboard/academic-years', [AcademicYearsController::class, 'index'])->name('academic-years.index');

// Departments Management
Route::get('/dashboard/departments', [DepartmentsController::class, 'index'])->name('departments.index');

// Settings
Route::get('/dashboard/settings', function () {
    return view('settings');
})->name('settings');

// Help
Route::get('/dashboard/help', function () {
    return view('help');
})->name('help');

/*
|--------------------------------------------------------------------------
| Shortcut routes for React SPA navigation
|--------------------------------------------------------------------------
| These routes render the same dashboard view so React can handle the frontend.
|
*/

Route::get('/students', [StudentController::class, 'index'])->name('students.shortcut');
Route::get('/faculty', [FacultyController::class, 'index'])->name('faculty.shortcut');
Route::get('/courses', [CoursesController::class, 'index'])->name('courses.shortcut');
Route::get('/departments', [DepartmentsController::class, 'index'])->name('departments.shortcut');
Route::get('/academicyears', [AcademicYearsController::class, 'index'])->name('academic-years.shortcut');

/*
|--------------------------------------------------------------------------
| Catch-all route (for SPA)
|--------------------------------------------------------------------------
| This ensures direct navigation (F5 refresh) on any React route still loads dashboard.
|
*/

Route::get('/{any}', function () {
    return view('dashboard');
})->where('any', '^(?!api).*$')->name('catch-all');
