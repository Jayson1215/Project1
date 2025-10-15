<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Handle login request
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ],
                'token' => $token
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials'
        ], 401);
    }

    /**
     * Handle demo login (for testing)
     */
    public function loginDemo(Request $request)
    {
        $credentials = $request->only(['username', 'password']);

        // Demo credentials
        $demoUsers = [
            'admin' => ['password' => 'admin123', 'name' => 'System Administrator', 'role' => 'admin'],
            'faculty' => ['password' => 'faculty123', 'name' => 'Dr. John Smith', 'role' => 'faculty'],
            'student' => ['password' => 'student123', 'name' => 'Jane Doe', 'role' => 'student']
        ];

        $username = $credentials['username'] ?? '';
        $password = $credentials['password'] ?? '';

        if (isset($demoUsers[$username]) && $demoUsers[$username]['password'] === $password) {
            return response()->json([
                'success' => true,
                'user' => [
                    'name' => $demoUsers[$username]['name'],
                    'role' => $demoUsers[$username]['role']
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials'
        ], 401);
    }

    /**
     * Handle logout request
     */
    public function logout(Request $request)
    {
        if (Auth::check()) {
            Auth::logout();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }
}
