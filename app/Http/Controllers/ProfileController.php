<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    // Save a new profile
    public function store(Request $request)
    {
        $profile = Profile::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
        ]);

        return response()->json($profile, 201);
    }

    // Get all profiles
    public function index()
    {
        return response()->json(Profile::all());
    }

    // Update profile
    public function update(Request $request, $id)
    {
        $profile = Profile::findOrFail($id);
        $profile->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
        ]);

        return response()->json($profile);
    }

    // Delete profile
    public function destroy($id)
    {
        $profile = Profile::findOrFail($id);
        $profile->delete();

        return response()->json(['message' => 'Profile deleted']);
    }
}
