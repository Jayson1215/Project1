<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Display the Dashboard page (React entry point).
     */
    public function index()
    {
        return view('dashboard');
    }

    /**
     * Example API endpoint for dashboard data (optional).
     * React frontend can fetch from `/api/dashboard-data`.
     */
    public function getDashboardData()
    {
        $data = [
            'total_students' => 1234,
            'faculty_members' => 89,
            'active_courses' => 156,
            'departments' => 12,
            'recent_activities' => [
                [
                    'action' => 'New student enrolled',
                    'details' => 'John Smith - Computer Science',
                    'time' => '2 hours ago'
                ],
                [
                    'action' => 'Course updated',
                    'details' => 'Data Structures - CS101',
                    'time' => '4 hours ago'
                ],
            ],
        ];

        return response()->json($data);
    }
}
