<?php

namespace App\Http\Controllers;

use App\Models\LeaveType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LeaveTypeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('leave-types/index', [
            'leaveTypes' => LeaveType::withCount('leaveRequests')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:leave_types,name'],
            'default_days_per_year' => ['required', 'integer', 'min:0', 'max:365'],
            'is_paid' => ['boolean'],
        ]);

        LeaveType::create($data);

        return back();
    }

    public function update(Request $request, LeaveType $leaveType): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('leave_types', 'name')->ignore($leaveType->id)],
            'default_days_per_year' => ['required', 'integer', 'min:0', 'max:365'],
            'is_paid' => ['boolean'],
        ]);

        $leaveType->update($data);

        return back();
    }

    public function destroy(LeaveType $leaveType): RedirectResponse
    {
        $leaveType->delete();

        return back();
    }
}
