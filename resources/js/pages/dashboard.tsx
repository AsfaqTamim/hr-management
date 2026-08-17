import { Head, Link } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import type { Employee, LeaveRequest } from '@/types/hr';
import { dashboard } from '@/routes';
import { Users, UserCheck, CalendarClock, UserPlus, Hourglass } from 'lucide-react';

interface Stats {
    headcount: number;
    active: number;
    on_leave: number;
    new_hires: number;
    pending_leave: number;
}

interface Props {
    stats: Stats;
    headcountByDepartment: { name: string; count: number }[];
    pendingRequests: LeaveRequest[];
    recentHires: Employee[];
}

export default function Dashboard({ stats, headcountByDepartment, pendingRequests, recentHires }: Props) {
    const maxCount = Math.max(1, ...headcountByDepartment.map((d) => d.count));

    return (
        <>
            <Head title="Dashboard" />
            
            <div className='flex h-full flex-1 flex-col gap-6 p-4'>
                 {/* KPI cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard icon={<Users className="h-5 w-5" />} label="Headcount" value={stats.headcount} />
                    <StatCard icon={<UserCheck className="h-5 w-5" />} label="Active" value={stats.active} />
                    <StatCard icon={<CalendarClock className="h-5 w-5" />} label="On leave" value={stats.on_leave} />
                    <StatCard icon={<UserPlus className="h-5 w-5" />} label="New this month" value={stats.new_hires} />
                    <StatCard icon={<Hourglass className="h-5 w-5" />} label="Pending leave" value={stats.pending_leave} />
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Headcount by department — CSS bar chart, no chart library needed */}
                    <div className="rounded-xl border p-5">
                        <h2 className="mb-4 font-semibold">Headcount by department</h2>
                        {headcountByDepartment.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No departments yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {headcountByDepartment.map((dept) => (
                                    <div key={dept.name}>
                                        <div className="mb-1 flex justify-between text-sm">
                                            <span>{dept.name}</span>
                                            <span className="font-medium">{dept.count}</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-primary"
                                                style={{ width: `${(dept.count / maxCount) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Pending leave requests */}
                    <div className="rounded-xl border p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold">Pending leave requests</h2>
                            <Link href="/leave-requests" className="text-sm text-primary hover:underline">View all</Link>
                        </div>
                        {pendingRequests.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nothing waiting for approval. 🎉</p>
                        ) : (
                            <div className="divide-y">
                                {pendingRequests.map((request) => (
                                    <div key={request.id} className="flex items-center justify-between py-2 text-sm">
                                        <div>
                                            <p className="font-medium">{request.employee?.full_name ?? '—'}</p>
                                            <p className="text-muted-foreground">{request.leave_type?.name} · {request.days} days</p>
                                        </div>
                                        <span className="text-muted-foreground">{request.start_date.slice(0, 10)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {/* Recent hires */}
                <div className="rounded-xl border p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold">Recent hires</h2>
                        <Link href="/employees" className="text-sm text-primary hover:underline">View directory</Link>
                    </div>
                    {recentHires.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No employees yet.</p>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {recentHires.map((employee) => (
                                <Link key={employee.id} href={`/employees/${employee.id}`} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/40">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                                        {`${employee.first_name[0] ?? ''}${employee.last_name[0] ?? ''}`.toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">{employee.full_name}</p>
                                        <p className="truncate text-xs text-muted-foreground">{employee.position?.title ?? '—'} · {employee.hire_date.slice(0, 10)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    return (
        <div className="rounded-xl border p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
                {icon}
                <span className="text-sm">{label}</span>
            </div>
            <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
