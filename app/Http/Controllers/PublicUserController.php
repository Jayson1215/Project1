<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Carbon;

class PublicUserController extends Controller
{
    // Update last_login for the user identified by email (no auth)
    public function setLastLogin(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $email = $request->input('email');

        $user = User::where('email', $email)->first();
        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->last_login = Carbon::now();
        $user->save();

        return response()->json(['message' => 'updated', 'last_login' => $user->last_login]);
    }
}