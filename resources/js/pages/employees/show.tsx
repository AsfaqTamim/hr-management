import { Head, Link } from '@inertiajs/react';
import type { Attendance, Employee, LeaveBalance, LeaveRequest, Payslip } from '@/types/hr';
import { ArrowLeft, Mail, Phone, MapPin, CalendarDays } from 'lucide-react';

interface Props {
    employee: Employee & {
        leave_balances?: LeaveBalance[];
        leave_requests?: LeaveRequest[];
        attendances?: Attendance[];
        payslips?: Payslip[];
    };
}

const statusStyles: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    on_leave: 'bg-amber-100 text-amber-700',
    terminated: 'bg-red-100 text-red-700',
};

const leaveStatusStyles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

function money(value: string) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));
}

export default function EmployeeShow({ employee }: Props) {
    const initials = `${employee.first_name[0] ?? ''}${employee.last_name[0] ?? ''}`.toUpperCase();

    return (
        <>
            <Head title={employee.full_name} />

            <div className="p-6">
                <Link href="/employees" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back to directory
                </Link>

                {/* Header card */}
                <div className="mb-6 flex flex-col gap-4 rounded-xl border p-6 sm:flex-row sm:items-center">
                    {employee.avatar_url ? (
                        <img src={employee.avatar_url} alt={employee.full_name} className="h-20 w-20 rounded-full object-cover" />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-xl font-semibold text-muted-foreground">
                            {initials}
                        </div>
                    )}
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">{employee.full_name}</h1>
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[employee.employment_status]}`}>
                                {employee.employment_status.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-muted-foreground">{employee.position?.title ?? 'No position'} · {employee.department?.name ?? 'No department'}</p>
                        {employee.manager && (
                            <p className="text-sm text-muted-foreground">Reports to {employee.manager.full_name}</p>
                        )}
                    </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                     {/* Contact & job */}
                     <div className="space-y-6">
                        <Section title="Contact">
                            <InfoRow icon={<Mail className="h-4 w-4" />} value={employee.email} />
                            {employee.phone && <InfoRow icon={<Phone className="h-4 w-4" />} value={employee.phone} />}
                            {employee.address && <InfoRow icon={<MapPin className="h-4 w-4" />} value={employee.address} />}
                            <InfoRow icon={<CalendarDays className="h-4 w-4" />} value={`Hired ${employee.hire_date.slice(0, 10)}`} />
                        </Section>

                        <Section title="Leave balances">
                            {employee.leave_balances && employee.leave_balances.length > 0 ? (
                                <ul className="space-y-2">
                                    {employee.leave_balances.map((b) => (
                                        <li key={b.id} className="flex items-center justify-between text-sm">
                                            <span>{b.leave_type?.name ?? 'Leave'}</span>
                                            <span className="font-medium">{b.remaining_days} / {b.entitled_days} days left</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">No balances recorded.</p>
                            )}
                        </Section>
                     </div>
                     {/* Leave & attendance */}
                     <div className="space-y-6 lg:col-span-2">
                        <Section title="Recent leave requests">
                            {employee.leave_requests && employee.leave_requests.length > 0 ? (
                                <div className="divide-y">
                                    {employee.leave_requests.map((r) => (
                                        <div key={r.id} className="flex items-center justify-between py-2 text-sm">
                                            <div>
                                                <p className="font-medium">{r.leave_type?.name ?? 'Leave'}</p>
                                                <p className="text-muted-foreground">{r.start_date.slice(0, 10)} → {r.end_date.slice(0, 10)} ({r.days} days)</p>
                                            </div>
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${leaveStatusStyles[r.status]}`}>{r.status}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No leave requests.</p>
                            )}
                        </Section>

                        <Section title="Recent attendance">
                            {employee.attendances && employee.attendances.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="text-left text-muted-foreground">
                                        <tr>
                                            <th className="py-1 font-medium">Date</th>
                                            <th className="py-1 font-medium">In</th>
                                            <th className="py-1 font-medium">Out</th>
                                            <th className="py-1 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employee.attendances.map((a) => (
                                            <tr key={a.id} className="border-t">
                                                <td className="py-1">{a.work_date.slice(0, 10)}</td>
                                                <td className="py-1">{a.clock_in ? a.clock_in.slice(11, 16) : '—'}</td>
                                                <td className="py-1">{a.clock_out ? a.clock_out.slice(11, 16) : '—'}</td>
                                                <td className="py-1 capitalize">{a.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-sm text-muted-foreground">No attendance records.</p>
                            )}
                        </Section>

                        <Section title="Recent payslips">
                            {employee.payslips && employee.payslips.length > 0 ? (
                                <div className="divide-y">
                                    {employee.payslips.map((p) => (
                                        <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                                            <span>{p.period_start.slice(0, 10)} → {p.period_end.slice(0, 10)}</span>
                                            <span className="font-medium">{money(p.net_pay)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No payslips.</p>
                            )}
                        </Section>
                     </div>
                </div>
            </div>
        </>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border p-4">
            <h2 className="mb-3 font-semibold">{title}</h2>
            {children}
        </div>
    );
}

function InfoRow({ icon, value }: { icon: React.ReactNode; value: string }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{icon}</span>
            <span>{value}</span>
        </div>
    );
}

EmployeeShow.layout = { breadcrumbs: [{ title: 'Employees', href: '/employees' }, { title: 'Profile', href: '#' }] };