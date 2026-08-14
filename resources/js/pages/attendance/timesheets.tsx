import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { CalendarCheck } from 'lucide-react';

interface TimesheetRecord {
    id: number;
    employee: string | null;
    department: string | null;
    clock_in: string | null;
    clock_out: string | null;
    status: string;
    hours: number | null;
}

interface Props {
    date: string;
    records: TimesheetRecord[];
    summary: { present: number; late: number; total_hours: number };
}

const statusStyles: Record<string, string> = {
    present: 'bg-green-100 text-green-700',
    late: 'bg-amber-100 text-amber-700',
    absent: 'bg-red-100 text-red-700',
};

export default function Timesheets({ date, records, summary }: Props) {
    function changeDate(value: string) {
        router.get('/timesheets', { date: value || undefined }, { preserveState: true, preserveScroll: true });
    }

    return (
        <>
            <Head title='Timesheets'/>
            <div className="p-6">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold">Timesheets</h1>
                    <div className="flex items-center gap-2">
                        <label htmlFor="ts-date" className="text-sm text-muted-foreground">Date</label>
                        <Input id="ts-date" type="date" value={date} onChange={(e) => changeDate(e.target.value)} className="w-auto" />
                    </div>
                </div>

                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                    <SummaryCard label="Present" value={summary.present} />
                    <SummaryCard label="Late" value={summary.late} />
                    <SummaryCard label="Total hours" value={summary.total_hours} />
                </div>

                {records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                        <CalendarCheck className="mb-3 h-12 w-12 text-muted-foreground" />
                        <p className="font-semibold">No attendance for this day</p>
                        <p className="mt-1 text-sm text-muted-foreground">Pick another date to see recorded hours.</p>
                    </div>
                ) : (
                    <div className="rounded-xl border">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/40">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Employee</th>
                                    <th className="px-4 py-3 text-left font-medium">Department</th>
                                    <th className="px-4 py-3 text-left font-medium">In</th>
                                    <th className="px-4 py-3 text-left font-medium">Out</th>
                                    <th className="px-4 py-3 text-right font-medium">Hours</th>
                                    <th className="px-4 py-3 text-center font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {records.map((row) => (
                                    <tr key={row.id} className="hover:bg-muted/20">
                                        <td className="px-4 py-3 font-medium">{row.employee ?? '—'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{row.department ?? '—'}</td>
                                        <td className="px-4 py-3">{row.clock_in ?? '—'}</td>
                                        <td className="px-4 py-3">{row.clock_out ?? '—'}</td>
                                        <td className="px-4 py-3 text-right">{row.hours ?? '—'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[row.status]}`}>{row.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
    );
}

Timesheets.layout = { breadcrumbs: [{ title: 'Timesheets', href: '/timesheets' }] };