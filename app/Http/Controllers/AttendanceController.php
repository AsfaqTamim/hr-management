<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * The signed-in user's own clock-in/out screen.
     */
    public function index(Request $request): Response
    {
        $employee = $request->user()->employee;
        $today = $employee?->attendances()
            ->whereDate('work_date', today())
            ->first();

        $recent = $employee?->attendances()
            ->latest('work_date')
            ->limit(10)
            ->get() ?? collect();

        return Inertia::render('attendance/index', [
            'hasEmployee' => (bool) $employee,
            'today' => $today,
            'recent' => $recent,
        ]);
    }

    public function clockIn(Request $request): RedirectResponse
    {
        $employee = $this->currentEmployee($request);

        $attendance = Attendance::firstOrNew([
            'employee_id' => $employee->id,
            'work_date' => today()->toDateString(),
        ]);

        if ($attendance->clock_in) {
            return back()->withErrors(['clock' => 'You have already clocked in today.']);
        }

        $now = now();
        $attendance->clock_in = $now;
        $attendance->status = (int) $now->format('H') >= 9 ? 'late' : 'present';
        $attendance->save();

        return back();
    }

    public function clockOut(Request $request): RedirectResponse
    {
        $employee = $this->currentEmployee($request);

        $attendance = $employee->attendances()
            ->whereDate('work_date', today())
            ->first();

        if (!$attendance || !$attendance->clock_in) {
            return back()->withErrors(['clock' => 'You need to clock in first.']);
        }

        if ($attendance->clock_out) {
            return back()->withErrors(['clock' => 'You have already clocked out today.']);
        }

        $attendance->update(['clock_out' => now()]);

        return back();
    }

    protected function currentEmployee(Request $request): Employee
    {
        $employee = $request->user()->employee;

        abort_unless($employee, 403, 'Your account is not linked to an employee record.');

        return $employee;
    }


    public function timesheets(Request $request): Response
    {
        $date = $request->filled('date')
            ? Carbon::parse($request->input('date'))
            : today();

        $records = Attendance::with('employee.department')
            ->whereDate('work_date', $date)
            ->get()
            ->map(fn(Attendance $a) => [
                'id' => $a->id,
                'employee' => $a->employee?->full_name,
                'department' => $a->employee?->department?->name,
                'clock_in' => $a->clock_in?->format('H:i'),
                'clock_out' => $a->clock_out?->format('H:i'),
                'status' => $a->status,
                'hours' => $a->clock_in && $a->clock_out
                    ? round($a->clock_in->floatDiffInHours($a->clock_out), 1)
                    : null,
            ]);

        return Inertia::render('attendance/timesheets', [
            'date' => $date->toDateString(),
            'records' => $records,
            'summary' => [
                'present' => $records->where('status', 'present')->count(),
                'late' => $records->where('status', 'late')->count(),
                'total_hours' => round($records->sum('hours'), 1),
            ],
        ]);
    }
}
