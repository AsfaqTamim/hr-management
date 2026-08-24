<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Payslip;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('reports/index');
    }

    /**
     * @param  array<int, string>  $headers
     */
    protected function streamCsv(string $filename, array $headers, callable $writeRows): StreamedResponse
    {
        return response()->streamDownload(function () use ($headers, $writeRows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $headers);
            $writeRows($handle);
            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    public function employees(): StreamedResponse
    {
        $headers = ['First name', 'Last name', 'Email', 'Department', 'Position', 'Status', 'Hire date', 'Salary'];

        return $this->streamCsv('employees.csv', $headers, function ($handle) {
            Employee::with(['department', 'position'])->chunk(200, function ($employees) use ($handle) {
                foreach ($employees as $employee) {
                    fputcsv($handle, [
                        $employee->first_name,
                        $employee->last_name,
                        $employee->email,
                        $employee->department?->name,
                        $employee->position?->title,
                        $employee->employment_status,
                        $employee->hire_date?->toDateString(),
                        $employee->salary,
                    ]);
                }
            });
        });
    }

    public function payroll(Request $request): StreamedResponse
    {
        $headers = ['Employee', 'Period start', 'Period end', 'Gross', 'Deductions', 'Net'];

        return $this->streamCsv('payroll.csv', $headers, function ($handle) {
            Payslip::with('employee')->chunk(200, function ($payslips) use ($handle) {
                foreach ($payslips as $payslip) {
                    fputcsv($handle, [
                        $payslip->employee?->full_name,
                        $payslip->period_start->toDateString(),
                        $payslip->period_end->toDateString(),
                        $payslip->gross_pay,
                        $payslip->deductions,
                        $payslip->net_pay,
                    ]);
                }
            });
        });
    }
}
