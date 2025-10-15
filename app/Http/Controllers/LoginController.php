<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only(['username', 'password']);

        // Demo users database
        $users = [
            'admin' => [
                'password' => 'password',
                'user' => [
                    'id' => 1,
                    'full_name' => 'System Administrator',
                    'role' => 'admin',
                    'email' => 'admin@eduportal.com'
                ]
            ],
            'faculty1' => [
                'password' => 'password',
                'user' => [
                    'id' => 2,
                    'full_name' => 'Dr. John Smith',
                    'role' => 'faculty',
                    'email' => 'faculty1@eduportal.com',
                    'department' => 'Computer Science'
                ]
            ],
            'student1' => [
                'password' => 'password',
                'user' => [
                    'id' => 3,
                    'full_name' => 'Jane Doe',
                    'role' => 'student',
                    'email' => 'student1@eduportal.com',
                    'student_id' => 'STU2024001'
                ]
            ]
        ];

        // Check credentials
        $username = $credentials['username'] ?? '';
        $password = $credentials['password'] ?? '';

        if (isset($users[$username]) && $users[$username]['password'] === $password) {
            return response()->json([
                'success' => true,
                'user' => $users[$username]['user'],
                'redirect' => '/dashboard'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid username or password'
        ], 401);
    }
}