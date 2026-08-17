<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $headcountByDepartment = Department::withCount('employees')
            ->orderByDesc('employees_count')
            ->get()
            ->map(fn (Department $d) => [
                'name' => $d->name,
                'count' => $d->employees_count,
            ]);

        return Inertia::render('dashboard', [
            'stats' => [
                'headcount' => Employee::count(),
                'active' => Employee::where('employment_status', 'active')->count(),
                'on_leave' => Employee::where('employment_status', 'on_leave')->count(),
                'new_hires' => Employee::whereBetween('hire_date', [now()->startOfMonth(), now()->endOfMonth()])->count(),
                'pending_leave' => LeaveRequest::where('status', 'pending')->count(),
            ],
            'headcountByDepartment' => $headcountByDepartment,
            'pendingRequests' => LeaveRequest::with(['employee', 'leaveType'])
                ->where('status', 'pending')
                ->latest()
                ->limit(5)
                ->get(),
            'recentHires' => Employee::with(['department', 'position'])
                ->latest('hire_date')
                ->limit(5)
                ->get(),
        ]);
    }
}
