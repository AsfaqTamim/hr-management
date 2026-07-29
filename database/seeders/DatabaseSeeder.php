<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Payslip;
use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ── Login accounts, one per role ────────────────────────────────────
        $admin = User::factory()->create([
            'name' => 'Alex Admin',
            'email' => 'admin@hr.test',
            'role' => 'admin',
        ]);

        $hr = User::factory()->create([
            'name' => 'Hana HR',
            'email' => 'hr@hr.test',
            'role' => 'hr',
        ]);

        $managerUser = User::factory()->create([
            'name' => 'Mia Manager',
            'email' => 'manager@hr.test',
            'role' => 'manager',
        ]);

        $employeeUser = User::factory()->create([
            'name' => 'Evan Employee',
            'email' => 'employee@hr.test',
            'role' => 'employee',
        ]);

        // ── Leave types ─────────────────────────────────────────────────────
        $annual = LeaveType::create(['name' => 'Annual Leave', 'default_days_per_year' => 20, 'is_paid' => true]);
        $sick = LeaveType::create(['name' => 'Sick Leave', 'default_days_per_year' => 10, 'is_paid' => true]);
        $unpaid = LeaveType::create(['name' => 'Unpaid Leave', 'default_days_per_year' => 0, 'is_paid' => false]);
        $leaveTypes = [$annual, $sick, $unpaid];

        // ── Departments + positions ─────────────────────────────────────────
        $blueprint = [
            'Engineering' => ['Software Engineer', 'Engineering Manager', 'QA Analyst'],
            'Human Resources' => ['HR Generalist', 'Recruiter', 'HR Manager'],
            'Sales' => ['Sales Representative', 'Account Executive', 'Sales Manager'],
            'Finance' => ['Accountant', 'Financial Analyst', 'Finance Manager'],
            'Marketing' => ['Content Strategist', 'Marketing Specialist'],
        ];

        $positions = collect();
        $departments = collect();

        foreach ($blueprint as $deptName => $titles) {
            $department = Department::create([
                'name' => $deptName,
                'code' => strtoupper(substr(str_replace(' ', '', $deptName), 0, 3)),
                'description' => "The {$deptName} department.",
            ]);
            $departments->push($department);

            foreach ($titles as $title) {
                $positions->push($department->positions()->create([
                    'title' => $title,
                    'description' => "{$title} in {$deptName}.",
                ]));
            }
        }

        // ── A few managers first, so staff can report to them ───────────────
        $managers = collect();
        foreach ($departments as $i => $department) {
            $managerPosition = $department->positions()
                ->where('title', 'like', '%Manager%')->first()
                ?? $department->positions()->first();

            $managers->push(Employee::factory()->create([
                'user_id' => $i === 0 ? $managerUser->id : null,
                'department_id' => $department->id,
                'position_id' => $managerPosition->id,
                'manager_id' => null,
            ]));
        }

        // ── Link the demo employee account to a real employee record ────────
        Employee::factory()->create([
            'user_id' => $employeeUser->id,
            'first_name' => 'Evan',
            'last_name' => 'Employee',
            'email' => 'employee@hr.test',
            'department_id' => $departments->first()->id,
            'position_id' => $positions->first()->id,
            'manager_id' => $managers->first()->id,
        ]);

        // ── The rest of the workforce ───────────────────────────────────────
        // Passing the foreign keys in explicitly overrides the factory defaults,
        // so it never tries to spin up brand-new departments or positions.
        for ($i = 0; $i < 30; $i++) {
            $department = $departments->random();
            $position = $positions->where('department_id', $department->id)->random();

            Employee::factory()->create([
                'department_id' => $department->id,
                'position_id' => $position->id,
                'manager_id' => $managers->random()->id,
            ]);
        }

        // ── Leave balances, requests, attendance and payslips per employee ──
        $year = (int) now()->year;

        Employee::all()->each(function (Employee $employee) use ($leaveTypes, $hr, $year) {
            foreach ($leaveTypes as $type) {
                LeaveBalance::create([
                    'employee_id' => $employee->id,
                    'leave_type_id' => $type->id,
                    'year' => $year,
                    'entitled_days' => $type->default_days_per_year,
                    'used_days' => 0,
                ]);
            }

            // ~40% of staff have a leave request on file
            if (rand(1, 10) <= 4) {
                $type = $leaveTypes[array_rand($leaveTypes)];
                $start = Carbon::now()->addDays(rand(-20, 20));
                $end = (clone $start)->addDays(rand(0, 4));
                $status = ['pending', 'approved', 'rejected'][array_rand(['pending', 'approved', 'rejected'])];

                LeaveRequest::create([
                    'employee_id' => $employee->id,
                    'leave_type_id' => $type->id,
                    'start_date' => $start->toDateString(),
                    'end_date' => $end->toDateString(),
                    'days' => $start->diffInDays($end) + 1,
                    'reason' => 'Personal time off.',
                    'status' => $status,
                    'reviewed_by' => $status === 'pending' ? null : $hr->id,
                    'reviewed_at' => $status === 'pending' ? null : now(),
                ]);
            }

            // Attendance for the last 5 working days
            for ($d = 1; $d <= 5; $d++) {
                $date = Carbon::now()->subDays($d);
                $in = (clone $date)->setTime(rand(8, 9), rand(0, 59));
                Attendance::create([
                    'employee_id' => $employee->id,
                    'work_date' => $date->toDateString(),
                    'clock_in' => $in,
                    'clock_out' => (clone $in)->addHours(rand(7, 9)),
                    'status' => (int) $in->format('H') >= 9 ? 'late' : 'present',
                ]);
            }

            // This month's payslip
            $gross = (float) $employee->salary / 12;
            $deductions = round($gross * 0.2, 2);
            Payslip::create([
                'employee_id' => $employee->id,
                'period_start' => now()->startOfMonth()->toDateString(),
                'period_end' => now()->endOfMonth()->toDateString(),
                'gross_pay' => round($gross, 2),
                'deductions' => $deductions,
                'net_pay' => round($gross - $deductions, 2),
                'issued_at' => now(),
            ]);
        });
    }
}
