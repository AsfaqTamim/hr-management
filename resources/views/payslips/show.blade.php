<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payslip — {{ $payslip->employee->full_name }}</title>
    <style>
         * { box-sizing: border-box; }
        body {
            font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
            color: #1f2937;
            margin: 0;
            padding: 40px;
            background: #f3f4f6;
        }
        .sheet {
            max-width: 720px;
            margin: 0 auto;
            background: #fff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 1px 3px rgba(0,0,0,.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #111827;
            padding-bottom: 16px;
            margin-bottom: 24px;
        }
        .company { font-size: 20px; font-weight: 700; }
        .muted { color: #6b7280; font-size: 13px; }
        h1 { font-size: 16px; text-transform: uppercase; letter-spacing: .08em; margin: 0; }
        .grid { display: flex; gap: 40px; margin-bottom: 28px; }
        .grid > div { flex: 1; }
        .label { font-size: 12px; text-transform: uppercase; color: #6b7280; letter-spacing: .05em; }
        .value { font-size: 15px; font-weight: 600; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { text-align: left; padding: 10px 12px; font-size: 14px; }
        thead th { background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
        tbody td { border-bottom: 1px solid #f3f4f6; }
        .num { text-align: right; }
        .total-row td { font-weight: 700; font-size: 16px; border-top: 2px solid #111827; }
        .print-btn {
            display: inline-block; margin: 0 auto 24px; padding: 10px 18px;
            background: #111827; color: #fff; border: none; border-radius: 8px;
            font-size: 14px; cursor: pointer;
        }
        .actions { text-align: center; }
        @media print {
            body { background: #fff; padding: 0; }
            .sheet { box-shadow: none; border-radius: 0; }
            .actions { display: none; }
        }
    </style>
</head>
<body>
    <div class="actions">
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
    </div>
    <div class="sheet">
        <div class="header">
            <div>
                <div class="company">{{ config('app.name') }}</div>
                <div class="muted">Payslip</div>
            </div>
            <div style="text-align: right;">
                <h1>Payslip</h1>
                <div class="muted">
                    {{ $payslip->period_start->format('d M Y') }} – {{ $payslip->period_end->format('d M Y') }}
                </div>
                @if ($payslip->issued_at)
                    <div class="muted">Issued {{ $payslip->issued_at->format('d M Y') }}</div>
                @endif
            </div>
        </div>

        <div class="grid">
            <div>
                <div class="label">Employee</div>
                <div class="value">{{ $payslip->employee->full_name }}</div>
                <div class="muted">{{ $payslip->employee->email }}</div>
            </div>
            <div>
                <div class="label">Position</div>
                <div class="value">{{ $payslip->employee->position?->title ?? '—' }}</div>
                <div class="muted">{{ $payslip->employee->department?->name ?? '—' }}</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="num">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Gross pay</td>
                    <td class="num">${{ number_format($payslip->gross_pay, 2) }}</td>
                </tr>
                <tr>
                    <td>Deductions (tax &amp; contributions)</td>
                    <td class="num">−${{ number_format($payslip->deductions, 2) }}</td>
                </tr>
                <tr class="total-row">
                    <td>Net pay</td>
                    <td class="num">${{ number_format($payslip->net_pay, 2) }}</td>
                </tr>
            </tbody>
        </table>

        <p class="muted" style="margin-top: 28px;">
            This is a computer-generated payslip and does not require a signature.
        </p>
    </div>
</body>
</html>