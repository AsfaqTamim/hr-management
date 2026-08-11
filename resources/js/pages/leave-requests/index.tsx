import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import type { LeaveRequest, Paginated } from '@/types/hr';
import type { Auth } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { CalendarClock, Check, Plus, X } from 'lucide-react';

interface Props {
    leaveRequests: Paginated<LeaveRequest>;
    employees: { id: number; first_name: string; last_name: string }[];
    leaveTypes: { id: number; name: string }[];
    filters: { status?: string };
}

const statusStyles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

const emptyForm = {
    employee_id: '',
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
};

export default function LeaveRequestsIndex({ leaveRequests, employees, leaveTypes, filters }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const canReview = ['admin', 'hr', 'manager'].includes(auth.user.role);

    const [showCreate, setShowCreate] = useState(false);
    const createForm = useForm({ ...emptyForm });

    function submitCreate(e: FormEvent) {
        e.preventDefault();
        createForm.post('/leave-requests', {
            onSuccess: () => { toast.success('Leave request submitted.'); setShowCreate(false); createForm.reset(); },
        });
    }

    function approve(request: LeaveRequest) {
        router.patch(`/leave-requests/${request.id}/approve`, {}, { onSuccess: () => toast.success('Request approved.') });
    }

    function reject(request: LeaveRequest) {
        const note = prompt('Reason for rejection (optional):') ?? '';
        router.patch(`/leave-requests/${request.id}/reject`, { note }, { onSuccess: () => toast.success('Request rejected.') });
    }

    function filterStatus(status: string) {
        router.get('/leave-requests', { status: status || undefined }, { preserveState: true, preserveScroll: true });
    }

    return (
        <>
            <Head title="Leave Requests" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Leave Requests</h1>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="mr-2 h-4 w-4" /> New Request
                    </Button>
                </div>

                <div className="mb-4 flex gap-2">
                    {['', 'pending', 'approved', 'rejected'].map((status) => (
                        <button
                            key={status || 'all'}
                            onClick={() => filterStatus(status)}
                            className={`rounded-full px-3 py-1 text-sm capitalize ${(filters.status ?? '') === status ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70'}`}
                        >
                            {status || 'all'}
                        </button>
                    ))}
                </div>

                {leaveRequests.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                        <CalendarClock className="mb-3 h-12 w-12 text-muted-foreground" />
                        <p className="font-semibold">No leave requests</p>
                        <p className="mt-1 text-sm text-muted-foreground">Requests submitted by staff will show up here.</p>
                    </div>
                ) : (
                    <>
                        <div className="rounded-xl border">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/40">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Employee</th>
                                        <th className="px-4 py-3 text-left font-medium">Type</th>
                                        <th className="px-4 py-3 text-left font-medium">Dates</th>
                                        <th className="px-4 py-3 text-right font-medium">Days</th>
                                        <th className="px-4 py-3 text-center font-medium">Status</th>
                                        <th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {leaveRequests.data.map((request) => (
                                        <tr key={request.id} className="hover:bg-muted/20">
                                            <td className="px-4 py-3 font-medium">
                                                {request.employee ? (
                                                    <Link href={`/employees/${request.employee.id}`} className="hover:underline">
                                                        {request.employee.full_name}
                                                    </Link>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{request.leave_type?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{request.start_date.slice(0, 10)} → {request.end_date.slice(0, 10)}</td>
                                            <td className="px-4 py-3 text-right">{request.days}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[request.status]}`}>{request.status}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {canReview && request.status === 'pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => approve(request)} className="inline-flex items-center rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700">
                                                            <Check className="mr-1 h-3 w-3" /> Approve
                                                        </button>
                                                        <button onClick={() => reject(request)} className="inline-flex items-center rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700">
                                                            <X className="mr-1 h-3 w-3" /> Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {leaveRequests.last_page > 1 && (
                            <div className="mt-4 flex justify-center gap-1">
                                {leaveRequests.links.map((link, i) =>
                                    link.url ? (
                                        <Link key={i} href={link.url} className={`rounded px-3 py-1.5 text-sm ${link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ) : (
                                        <span key={i} className="rounded px-3 py-1.5 text-sm opacity-40" dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ),
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            <Dialog open={showCreate} onOpenChange={(open) => { if (!open) { setShowCreate(false); createForm.reset(); } }}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>New Leave Request</DialogTitle></DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div>
                            <Label htmlFor="lr-emp">Employee</Label>
                            <select id="lr-emp" value={createForm.data.employee_id} onChange={(e) => createForm.setData('employee_id', e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="">Select employee…</option>
                                {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>)}
                            </select>
                            <InputError message={createForm.errors.employee_id} />
                        </div>
                        <div>
                            <Label htmlFor="lr-type">Leave type</Label>
                            <select id="lr-type" value={createForm.data.leave_type_id} onChange={(e) => createForm.setData('leave_type_id', e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="">Select type…</option>
                                {leaveTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <InputError message={createForm.errors.leave_type_id} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="lr-start">Start date</Label>
                                <Input id="lr-start" type="date" value={createForm.data.start_date} onChange={(e) => createForm.setData('start_date', e.target.value)} />
                                <InputError message={createForm.errors.start_date} />
                            </div>
                            <div>
                                <Label htmlFor="lr-end">End date</Label>
                                <Input id="lr-end" type="date" value={createForm.data.end_date} onChange={(e) => createForm.setData('end_date', e.target.value)} />
                                <InputError message={createForm.errors.end_date} />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="lr-reason">Reason</Label>
                            <textarea id="lr-reason" rows={2} value={createForm.data.reason} onChange={(e) => createForm.setData('reason', e.target.value)} className="flex min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                            <InputError message={createForm.errors.reason} />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                            <Button type="button" variant="outline" onClick={() => { setShowCreate(false); createForm.reset(); }}>Cancel</Button>
                            <Button type="submit" disabled={createForm.processing}>{createForm.processing ? 'Submitting…' : 'Submit'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );

}