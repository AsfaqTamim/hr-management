<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Employee::with(['department', 'position'])->latest();

        if ($request->filled('search')) {
            $term = "%{$request->input('search')}%";
            $query->where(function ($q) use ($term) {
                $q->where('first_name', 'like', $term)
                    ->orWhere('last_name', 'like', $term)
                    ->orWhere('email', 'like', $term);
            });
        }

        if ($request->filled('department')) {
            $query->where('department_id', $request->integer('department'));
        }

        if ($request->filled('status')) {
            $query->where('employment_status', $request->input('status'));
        }

        return Inertia::render('employees/index', [
            'employees' => $query->paginate(12)->withQueryString(),
            'departments' => Department::orderBy('name')->get(['id', 'name']),
            'positions' => Position::orderBy('title')->get(['id', 'title', 'department_id']),
            'managers' => Employee::orderBy('first_name')->get(['id', 'first_name', 'last_name']),
            'filters' => $request->only(['search', 'department', 'status']),
        ]);
    }

    public function show(Employee $employee): Response
    {
        $employee->load([
            'department',
            'position',
            'manager',
            'leaveBalances.leaveType',
            'leaveRequests.leaveType',
            'attendances' => fn($q) => $q->latest('work_date')->limit(10),
            'payslips' => fn($q) => $q->latest('period_end')->limit(6),
        ]);

        return Inertia::render('employees/show', [
            'employee' => $employee,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function validateEmployee(Request $request, ?Employee $employee = null): array
    {
        return $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:employees,email' . ($employee ? ',' . $employee->id : '')],
            'phone' => ['nullable', 'string', 'max:50'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'position_id' => ['nullable', 'exists:positions,id'],
            'manager_id' => ['nullable', 'exists:employees,id'],
            'hire_date' => ['required', 'date'],
            'employment_status' => ['required', 'in:active,on_leave,terminated'],
            'salary' => ['required', 'numeric', 'min:0'],
            'address' => ['nullable', 'string'],
            'avatar' => ['nullable', 'image', 'max:2048'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateEmployee($request);

        if ($request->hasFile('avatar')) {
            $data['avatar_path'] = $request->file('avatar')->store('avatars', 'public');
        }
        unset($data['avatar']);

        Employee::create($data);

        return back();
    }

    public function update(Request $request, Employee $employee): RedirectResponse
    {
        $data = $this->validateEmployee($request, $employee);

        if ($request->hasFile('avatar')) {
            if ($employee->avatar_path) {
                Storage::disk('public')->delete($employee->avatar_path);
            }
            $data['avatar_path'] = $request->file('avatar')->store('avatars', 'public');
        }
        unset($data['avatar']);

        $employee->update($data);

        return back();
    }

    public function destroy(Employee $employee): RedirectResponse
    {
        if ($employee->avatar_path) {
            Storage::disk('public')->delete($employee->avatar_path);
        }

        $employee->delete();

        return to_route('employees.index');
    }
}
