import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import type { Attendance } from '@/types/hr';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Clock } from 'lucide-react';

interface Props {
    hasEmployee: boolean;
    today: Attendance | null;
    recent: Attendance[];
}

function time(value: string | null) {
    return value ? value.slice(11, 16) : '—';
}

export default function AttendanceIndex({ hasEmployee, today, recent }: Props) {
    const clockedIn = !!today?.clock_in;
    const clockedOut = !!today?.clock_out;

    function clockIn() {
        router.post('/attendance/clock-in', {}, { onSuccess: () => toast.success('Clocked in. Have a great day!') });
    }

    function clockOut() {
        router.post('/attendance/clock-out', {}, { onSuccess: () => toast.success('Clocked out. See you tomorrow!') });
    }

    return (
        <>
            <Head title="Attendance" />

            <div className="p-6">
                <h1 className="mb-6 text-2xl font-bold">My Attendance</h1>

                {!hasEmployee ? (
                    <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                        Your login isn&apos;t linked to an employee record yet, so you can&apos;t clock in.
                        Ask HR to connect your account.
                    </div>
                ) : (
                    <>
                        <div className="mb-8 flex flex-col items-center rounded-xl border p-8">
                            <Clock className="mb-3 h-10 w-10 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                {!clockedIn && 'You have not clocked in today.'}
                                {clockedIn && !clockedOut && `Clocked in at ${time(today!.clock_in)}.`}
                                {clockedIn && clockedOut && `Today: ${time(today!.clock_in)} – ${time(today!.clock_out)}.`}
                            </p>
                            <div className="mt-4 flex gap-3">
                                <Button onClick={clockIn} disabled={clockedIn}>
                                    <LogIn className="mr-2 h-4 w-4" /> Clock In
                                </Button>
                                <Button onClick={clockOut} disabled={!clockedIn || clockedOut} variant="outline">
                                    <LogOut className="mr-2 h-4 w-4" /> Clock Out
                                </Button>
                            </div>
                        </div>

                        <h2 className="mb-3 font-semibold">Recent days</h2>
                        {recent.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No attendance recorded yet.</p>
                        ) : (
                            <div className="rounded-xl border">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/40">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Date</th>
                                            <th className="px-4 py-3 text-left font-medium">Clock in</th>
                                            <th className="px-4 py-3 text-left font-medium">Clock out</th>
                                            <th className="px-4 py-3 text-center font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {recent.map((row) => (
                                            <tr key={row.id} className="hover:bg-muted/20">
                                                <td className="px-4 py-3">{row.work_date.slice(0, 10)}</td>
                                                <td className="px-4 py-3">{time(row.clock_in)}</td>
                                                <td className="px-4 py-3">{time(row.clock_out)}</td>
                                                <td className="px-4 py-3 text-center capitalize">{row.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

AttendanceIndex.layout = { breadcrumbs: [{ title: 'Attendance', href: '/attendance' }] };