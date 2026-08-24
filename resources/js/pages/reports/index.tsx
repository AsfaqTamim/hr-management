import { Head } from '@inertiajs/react';
import { Download, Users, Receipt } from 'lucide-react';

interface ReportCard {
    title: string;
    description: string;
    href: string;
    icon: React.ReactNode;
}

const reports: ReportCard[] = [
    {
        title: 'Employee directory',
        description: 'Every employee with department, position, status, hire date and salary.',
        href: '/reports/employees.csv',
        icon: <Users className="h-5 w-5" />,
    },
    {
        title: 'Payroll export',
        description: 'All generated payslips with gross, deductions and net pay.',
        href: '/reports/payroll.csv',
        icon: <Receipt className="h-5 w-5" />,
    },
];

export default function ReportsIndex() {
    return (
        <>
            <Head title="Reports" />

            <div className="p-6">
                <h1 className="mb-2 text-2xl font-bold">Reports</h1>
                <p className="mb-6 text-muted-foreground">Download HR data as CSV for spreadsheets and audits.</p>

                <div className="grid gap-4 sm:grid-cols-2">
                    {reports.map((report) => (
                        <div key={report.href} className="flex flex-col rounded-xl border p-5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                {report.icon}
                                <span className="font-semibold text-foreground">{report.title}</span>
                            </div>
                            <p className="mt-2 flex-1 text-sm text-muted-foreground">{report.description}</p>
                            <a
                                href={report.href}
                                className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                <Download className="mr-2 h-4 w-4" /> Download CSV
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

ReportsIndex.layout = { breadcrumbs: [{ title: 'Reports', href: '/reports' }] };