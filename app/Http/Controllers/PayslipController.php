<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Payslip;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;

class PayslipController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Payslip::with('employee')->latest('period_end');

        if ($request->filled('employee')) {
            $query->where('employee_id', $request->integer('employee'));
        }

        return Inertia::render('payslips/index', [
            'payslips' => $query->paginate(15)->withQueryString(),
            'employees' => Employee::orderBy('first_name')->get(['id', 'first_name', 'last_name']),
            'filters' => $request->only(['employee']),
        ]);
    }


    /**
     * Run payroll: generate a payslip for every active employee for a month.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
        ]);

        $period = Carbon::createFromFormat('Y-m', $data['month']);
        $start = $period->copy()->startOfMonth();
        $end = $period->copy()->endOfMonth();

        $created = 0;

        Employee::where('employment_status', 'active')->each(function (Employee $employee) use ($start, $end, &$created) {
            $exists = $employee->payslips()
                ->whereDate('period_start', $start->toDateString())
                ->exists();

            if ($exists) {
                return;
            }

            $gross = round((float) $employee->salary / 12, 2);
            $deductions = round($gross * 0.2, 2);

            $employee->payslips()->create([
                'period_start' => $start->toDateString(),
                'period_end' => $end->toDateString(),
                'gross_pay' => $gross,
                'deductions' => $deductions,
                'net_pay' => $gross - $deductions,
                'issued_at' => now(),
            ]);

            $created++;
        });

        return back()->with('flash', "Generated {$created} payslip(s).");
    }

        /**
     * A print-ready payslip. Open in a new tab and use the browser's
     * "Save as PDF" — no extra server dependency required.
     */
        public function show(Payslip $payslip): View
        {
            $payslip->load('employee.department', 'employee.position');
    
            return view('payslips.show', [
                'payslip' => $payslip,
            ]);
        }
}
