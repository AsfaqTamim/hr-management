import { Head, router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import type { LeaveType } from '@/types/hr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react';

interface Props {
    leaveTypes: (LeaveType & { leave_requests_count: number })[];
}

const emptyForm = {
    name: '',
    default_days_per_year: '',
    is_paid: true,
};

export default function LeaveTypesIndex({ leaveTypes }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<LeaveType | null>(null);

    const createForm = useForm({ ...emptyForm });
    const editForm = useForm({ ...emptyForm });

    function submitCreate(e: FormEvent) {
        e.preventDefault();
        createForm.post('/leave-types', {
            onSuccess: () => { toast.success('Leave type created.'); setShowCreate(false); createForm.reset(); },
        });
    }

    function openEdit(type: LeaveType) {
        setEditing(type);
        editForm.setData({
            name: type.name,
            default_days_per_year: String(type.default_days_per_year),
            is_paid: type.is_paid,
        });
    }

    function submitEdit(e: FormEvent) {
        e.preventDefault();
        if (!editing) return;
        editForm.patch(`/leave-types/${editing.id}`, {
            onSuccess: () => { toast.success('Leave type updated.'); setEditing(null); },
        });
    }

    function handleDelete(type: LeaveType) {
        if (!confirm(`Delete "${type.name}"?`)) return;
        router.delete(`/leave-types/${type.id}`, { onSuccess: () => toast.success('Leave type deleted.') });
    }

    return (
        <>
            <Head title="Leave Types" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Leave Types</h1>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Leave Type
                    </Button>
                </div>
                {leaveTypes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                        <CalendarClock className="mb-3 h-12 w-12 text-muted-foreground" />
                        <p className="font-semibold">No leave types yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">Define the kinds of leave staff can request.</p>
                        <Button className="mt-4" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" /> Add Leave Type</Button>
                    </div>
                ) : (
                    <div className="rounded-xl border">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/40">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Name</th>
                                    <th className="px-4 py-3 text-right font-medium">Days / year</th>
                                    <th className="px-4 py-3 text-center font-medium">Paid</th>
                                    <th className="px-4 py-3 text-right font-medium">Requests</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {leaveTypes.map((type) => (
                                    <tr key={type.id} className="hover:bg-muted/20">
                                        <td className="px-4 py-3 font-medium">{type.name}</td>
                                        <td className="px-4 py-3 text-right">{type.default_days_per_year}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${type.is_paid ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                                                {type.is_paid ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">{type.leave_requests_count}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEdit(type)} className="text-muted-foreground hover:text-foreground" title="Edit"><Pencil className="h-4 w-4" /></button>
                                                <button onClick={() => handleDelete(type)} className="text-muted-foreground hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Dialog open={showCreate} onOpenChange={(open) => { if (!open) { setShowCreate(false); createForm.reset(); } }}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Add Leave Type</DialogTitle></DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <LeaveTypeFormFields form={createForm} />
                        <div className="flex justify-end gap-2 pt-1">
                            <Button type="button" variant="outline" onClick={() => { setShowCreate(false); createForm.reset(); }}>Cancel</Button>
                            <Button type="submit" disabled={createForm.processing}>{createForm.processing ? 'Saving…' : 'Create'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Edit Leave Type</DialogTitle></DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <LeaveTypeFormFields form={editForm} />
                        <div className="flex justify-end gap-2 pt-1">
                            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                            <Button type="submit" disabled={editForm.processing}>{editForm.processing ? 'Saving…' : 'Save'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

function LeaveTypeFormFields({ form }: { form: ReturnType<typeof useForm<typeof emptyForm>> }) {
    return (
        <>
            <div>
                <Label htmlFor="lt-name">Name</Label>
                <Input id="lt-name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} autoFocus />
                <InputError message={form.errors.name} />
            </div>
            <div>
                <Label htmlFor="lt-days">Default days per year</Label>
                <Input id="lt-days" type="number" min="0" max="365" value={form.data.default_days_per_year} onChange={(e) => form.setData('default_days_per_year', e.target.value)} />
                <InputError message={form.errors.default_days_per_year} />
            </div>
            <div className="flex items-center gap-2">
                <input type="checkbox" id="lt-paid" checked={form.data.is_paid} onChange={(e) => form.setData('is_paid', e.target.checked)} className="h-4 w-4 rounded" />
                <Label htmlFor="lt-paid">Paid leave</Label>
            </div>
        </>
    );
}

LeaveTypesIndex.layout = { breadcrumbs: [{ title: 'Leave Types', href: '/leave-types' }] };