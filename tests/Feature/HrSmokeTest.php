<?php

use App\Models\Employee;
use App\Models\Payslip;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
});

it('lets an admin load every HR page', function () {
    $admin = User::where('email', 'admin@hr.test')->first();

    $pages = [
        '/dashboard',
        '/employees',
        '/departments',
        '/positions',
        '/leave-requests',
        '/leave-types',
        '/payslips',
        '/attendance',
        '/timesheets',
        '/reports',
    ];

    foreach ($pages as $page) {
        $this->actingAs($admin)->get($page)->assertOk();
    }
});

it('shows an employee profile and a printable payslip', function () {
    $admin = User::where('email', 'admin@hr.test')->first();
    $employee = Employee::first();
    $payslip = Payslip::first();

    $this->actingAs($admin)->get("/employees/{$employee->id}")->assertOk();
    $this->actingAs($admin)->get("/payslips/{$payslip->id}")
        ->assertOk()
        ->assertSee('Net pay');
});

it('blocks a plain employee from HR-only areas', function () {
    $employee = User::where('email', 'employee@hr.test')->first();

    $this->actingAs($employee)->get('/departments')->assertForbidden();
    $this->actingAs($employee)->get('/payslips')->assertForbidden();
    // …but they can reach their own attendance and the leave list.
    $this->actingAs($employee)->get('/attendance')->assertOk();
    $this->actingAs($employee)->get('/leave-requests')->assertOk();
});

it('approves a leave request and deducts the balance', function () {
    $hr = User::where('email', 'hr@hr.test')->first();
    $employee = Employee::first();

    $leaveType = App\Models\LeaveType::where('name', 'Annual Leave')->first();
    App\Models\LeaveBalance::updateOrCreate(
        ['employee_id' => $employee->id, 'leave_type_id' => $leaveType->id, 'year' => now()->year],
        ['entitled_days' => 20, 'used_days' => 0],
    );

    $request = App\Models\LeaveRequest::create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'start_date' => now()->toDateString(),
        'end_date' => now()->addDays(2)->toDateString(),
        'days' => 3,
        'status' => 'pending',
    ]);

    $this->actingAs($hr)->patch("/leave-requests/{$request->id}/approve")->assertRedirect();

    expect($request->fresh()->status)->toBe('approved');
    expect(App\Models\LeaveBalance::where('employee_id', $employee->id)
        ->where('leave_type_id', $leaveType->id)
        ->where('year', now()->year)
        ->first()->used_days)->toBe(3);
});