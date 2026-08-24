<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\LeaveTypeController;
use App\Http\Controllers\PayslipController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    // ── Reports & exports (HR & admins) ─────────────────────────────────────
    Route::middleware('role:admin,hr')->group(function () {
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('reports/employees.csv', [ReportController::class, 'employees'])->name('reports.employees');
        Route::get('reports/payroll.csv', [ReportController::class, 'payroll'])->name('reports.payroll');
    });

    
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── People administration (HR & admins only) ────────────────────────────
    Route::middleware('role:admin,hr')->group(function () {
        Route::get('departments', [DepartmentController::class, 'index'])->name('departments.index');
        Route::post('departments', [DepartmentController::class, 'store'])->name('departments.store');
        Route::patch('departments/{department}', [DepartmentController::class, 'update'])->name('departments.update');
        Route::delete('departments/{department}', [DepartmentController::class, 'destroy'])->name('departments.destroy');

        Route::get('positions', [PositionController::class, 'index'])->name('positions.index');
        Route::post('positions', [PositionController::class, 'store'])->name('positions.store');
        Route::patch('positions/{position}', [PositionController::class, 'update'])->name('positions.update');
        Route::delete('positions/{position}', [PositionController::class, 'destroy'])->name('positions.destroy');
    });

    Route::middleware('role:admin,hr,manager')->group(function () {
        Route::get('employees', [EmployeeController::class, 'index'])->name('employees.index');
        Route::get('employees/{employee}', [EmployeeController::class, 'show'])->name('employees.show');
    });

    // Only HR & admins can create, edit or remove employees.
    Route::middleware('role:admin,hr')->group(function () {
        Route::post('employees', [EmployeeController::class, 'store'])->name('employees.store');
        Route::patch('employees/{employee}', [EmployeeController::class, 'update'])->name('employees.update');
        Route::delete('employees/{employee}', [EmployeeController::class, 'destroy'])->name('employees.destroy');
    });

    // Leave types are configured by HR & admins.
    Route::middleware('role:admin,hr')->group(function () {
        Route::get('leave-types', [LeaveTypeController::class, 'index'])->name('leave-types.index');
        Route::post('leave-types', [LeaveTypeController::class, 'store'])->name('leave-types.store');
        Route::patch('leave-types/{leaveType}', [LeaveTypeController::class, 'update'])->name('leave-types.update');
        Route::delete('leave-types/{leaveType}', [LeaveTypeController::class, 'destroy'])->name('leave-types.destroy');
    });

    // ── Leave management ────────────────────────────────────────────────────
    // Everyone signed in can view the leave list and file a request…
    Route::get('leave-requests', [LeaveRequestController::class, 'index'])->name('leave-requests.index');
    Route::post('leave-requests', [LeaveRequestController::class, 'store'])->name('leave-requests.store');

    // …but only HR, admins and managers can approve or reject them.
    Route::middleware('role:admin,hr,manager')->group(function () {
        Route::patch('leave-requests/{leaveRequest}/approve', [LeaveRequestController::class, 'approve'])->name('leave-requests.approve');
        Route::patch('leave-requests/{leaveRequest}/reject', [LeaveRequestController::class, 'reject'])->name('leave-requests.reject');
    });

    // ── Attendance ──────────────────────────────────────────────────────────
    // Anyone can clock in/out for themselves…
    Route::get('attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('attendance/clock-in', [AttendanceController::class, 'clockIn'])->name('attendance.clock-in');
    Route::post('attendance/clock-out', [AttendanceController::class, 'clockOut'])->name('attendance.clock-out');

    // …HR, admins and managers see the company-wide timesheet.
    Route::middleware('role:admin,hr,manager')->group(function () {
        Route::get('timesheets', [AttendanceController::class, 'timesheets'])->name('timesheets.index');
    });

    // ── Payroll (HR & admins) ───────────────────────────────────────────────
    Route::middleware('role:admin,hr')->group(function () {
        Route::get('payslips', [PayslipController::class, 'index'])->name('payslips.index');
        Route::post('payslips', [PayslipController::class, 'store'])->name('payslips.store');
        Route::get('payslips/{payslip}', [PayslipController::class, 'show'])->name('payslips.show');
    });

});

require __DIR__ . '/settings.php';
