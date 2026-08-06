import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import type { Department, Employee, Paginated, Position } from '@/types/hr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react';

interface Filters {
    search?: string;
    department?: string;
    status?: string;
}

interface Props {
    employees: Paginated<Employee>;
    departments: Pick<Department, 'id' | 'name'>[];
    positions: Pick<Position, 'id' | 'title' | 'department_id'>[];
    managers: { id: number; first_name: string; last_name: string }[];
    filters: Filters;
}

const emptyForm = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department_id: '',
    position_id: '',
    manager_id: '',
    hire_date: '',
    employment_status: 'active',
    salary: '',
    address: '',
    avatar: null as File | null,
};

const statusStyles: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    on_leave: 'bg-amber-100 text-amber-700',
    terminated: 'bg-red-100 text-red-700',
};


export default function EmployeesIndex({ employees, departments, positions, managers, filters}: Props){
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<Employee | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');

    const createForm = useForm({ ...emptyForm });
    const editForm = useForm({ ...emptyForm });

    function submitCreate(e: FormEvent) {
        e.preventDefault();
        createForm.post('/employees', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Employee added.');
                setShowCreate(false);
                createForm.reset();
            },
        });
    }

    function openEdit(employee: Employee) {
        setEditing(employee);
        editForm.setData({
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            phone: employee.phone ?? '',
            department_id: employee.department_id ? String(employee.department_id) : '',
            position_id: employee.position_id ? String(employee.position_id) : '',
            manager_id: employee.manager_id ? String(employee.manager_id) : '',
            hire_date: employee.hire_date?.slice(0, 10) ?? '',
            employment_status: employee.employment_status,
            salary: String(employee.salary),
            address: employee.address ?? '',
            avatar: null,
        });
    }

    function submitEdit(e: FormEvent) {
        e.preventDefault();
        if (!editing) return;
        // Files can't be sent over PATCH, so we POST with a spoofed method.
        editForm.transform((data) => ({ ...data, _method: 'patch' }));
        editForm.post(`/employees/${editing.id}`, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Employee updated.');
                setEditing(null);
            },
        });
    }

    function handleDelete(employee: Employee) {
        if (!confirm(`Remove ${employee.full_name} from the directory?`)) return;
        router.delete(`/employees/${employee.id}`, {
            onSuccess: () => toast.success('Employee removed.'),
        });
    }

    function applyFilters(next: Filters) {
        router.get('/employees', {
            search: next.search || undefined,
            department: next.department || undefined,
            status: next.status || undefined,
        }, { preserveState: true, preserveScroll: true });
    }

    return (
        <>
            <Head title='Employees'/>

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Employees</h1>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Employee
                    </Button>
                </div>
                <div className="mb-4 flex flex-wrap gap-2">
                    <form onSubmit={(e) => { e.preventDefault(); applyFilters({ ...filters, search }); }} className="flex gap-2">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input className="pl-9" placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <Button type="submit">Search</Button>
                    </form>

                    <select
                        value={filters.department ?? ''}
                        onChange={(e) => applyFilters({ ...filters, department: e.target.value })}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="">All departments</option>
                        {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>

                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilters({ ...filters, status: e.target.value })}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="">Any status</option>
                        <option value="active">Active</option>
                        <option value="on_leave">On leave</option>
                        <option value="terminated">Terminated</option>
                    </select>
                </div>
                {employees.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                        <Users className="mb-3 h-12 w-12 text-muted-foreground" />
                        <p className="font-semibold">No employees found</p>
                        <p className="mt-1 text-sm text-muted-foreground">Add your first team member to get started.</p>
                        <Button className="mt-4" onClick={() => setShowCreate(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Employee
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {employees.data.map((employee) => (
                                <div key={employee.id} className="flex flex-col rounded-xl border p-4">
                                    <div className="flex items-start gap-3">
                                        <Avatar employee={employee} />
                                        <div className="min-w-0 flex-1">
                                            <Link href={`/employees/${employee.id}`} className="font-semibold hover:underline">
                                                {employee.full_name}
                                            </Link>
                                            <p className="truncate text-sm text-muted-foreground">{employee.position?.title ?? 'No position'}</p>
                                            <p className="truncate text-xs text-muted-foreground">{employee.department?.name ?? '—'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[employee.employment_status]}`}>
                                            {employee.employment_status.replace('_', ' ')}
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(employee)} className="text-muted-foreground hover:text-foreground" title="Edit">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(employee)} className="text-muted-foreground hover:text-destructive" title="Remove">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {employees.last_page > 1 && (
                            <div className="mt-6 flex justify-center gap-1">
                                {employees.links.map((link, i) =>
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
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Employee</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <EmployeeFormFields form={createForm} departments={departments} positions={positions} managers={managers} />
                        <div className="flex justify-end gap-2 pt-1">
                            <Button type="button" variant="outline" onClick={() => { setShowCreate(false); createForm.reset(); }}>Cancel</Button>
                            <Button type="submit" disabled={createForm.processing}>{createForm.processing ? 'Saving…' : 'Create'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <EmployeeFormFields form={editForm} departments={departments} positions={positions} managers={managers} />
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

EmployeesIndex.layout = { breadcrumbs: [{ title: 'Employees', href: '/employees' }] };

function Avatar({ employee }: {employee: Employee}) {
    const initials = `${employee.first_name[0] ?? ''}${employee.last_name[0] ?? ''}`.toUpperCase();

    if (employee.avatar_url) {
        return <img src={employee.avatar_url} alt={employee.full_name} className='h-12 w-12 rounded-full object-cover' />
    }

    return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
            {initials}
        </div>
    );
}

function EmployeeFormFields({
    form,
    departments,
    positions,
    managers,
}: {
    form: ReturnType<typeof useForm<typeof emptyForm>>;
    departments: Pick<Department, 'id' | 'name'>[];
    positions: Pick<Position, 'id' | 'title' | 'department_id'>[];
    managers: { id: number; first_name: string; last_name: string }[];
}) {
    const availablePositions = form.data.department_id
        ? positions.filter((p) => String(p.department_id) === form.data.department_id)
        : positions;

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="e-first">First name</Label>
                    <Input id="e-first" value={form.data.first_name} onChange={(e) => form.setData('first_name', e.target.value)} autoFocus />
                    <InputError message={form.errors.first_name} />
                </div>
                <div>
                    <Label htmlFor="e-last">Last name</Label>
                    <Input id="e-last" value={form.data.last_name} onChange={(e) => form.setData('last_name', e.target.value)} />
                    <InputError message={form.errors.last_name} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="e-email">Email</Label>
                    <Input id="e-email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                    <InputError message={form.errors.email} />
                </div>
                <div>
                    <Label htmlFor="e-phone">Phone</Label>
                    <Input id="e-phone" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                    <InputError message={form.errors.phone} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="e-dept">Department</Label>
                    <select
                        id="e-dept"
                        value={form.data.department_id}
                        onChange={(e) => { form.setData('department_id', e.target.value); form.setData('position_id', ''); }}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="">Unassigned</option>
                        {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <InputError message={form.errors.department_id} />
                </div>
                <div>
                    <Label htmlFor="e-pos">Position</Label>
                    <select
                        id="e-pos"
                        value={form.data.position_id}
                        onChange={(e) => form.setData('position_id', e.target.value)}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="">Unassigned</option>
                        {availablePositions.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                    <InputError message={form.errors.position_id} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="e-manager">Manager</Label>
                    <select
                        id="e-manager"
                        value={form.data.manager_id}
                        onChange={(e) => form.setData('manager_id', e.target.value)}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="">None</option>
                        {managers.map((m) => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                    </select>
                    <InputError message={form.errors.manager_id} />
                </div>
                <div>
                    <Label htmlFor="e-status">Status</Label>
                    <select
                        id="e-status"
                        value={form.data.employment_status}
                        onChange={(e) => form.setData('employment_status', e.target.value)}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="active">Active</option>
                        <option value="on_leave">On leave</option>
                        <option value="terminated">Terminated</option>
                    </select>
                    <InputError message={form.errors.employment_status} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="e-hire">Hire date</Label>
                    <Input id="e-hire" type="date" value={form.data.hire_date} onChange={(e) => form.setData('hire_date', e.target.value)} />
                    <InputError message={form.errors.hire_date} />
                </div>
                <div>
                    <Label htmlFor="e-salary">Annual salary</Label>
                    <Input id="e-salary" type="number" min="0" step="0.01" value={form.data.salary} onChange={(e) => form.setData('salary', e.target.value)} />
                    <InputError message={form.errors.salary} />
                </div>
            </div>

            <div>
                <Label htmlFor="e-address">Address</Label>
                <textarea
                    id="e-address"
                    rows={2}
                    value={form.data.address}
                    onChange={(e) => form.setData('address', e.target.value)}
                    className="flex min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <InputError message={form.errors.address} />
            </div>

            <div>
                <Label htmlFor="e-avatar">Photo</Label>
                <Input
                    id="e-avatar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => form.setData('avatar', e.target.files?.[0] ?? null)}
                />
                {form.progress && (
                    <progress value={form.progress.percentage} max="100" className="mt-1 w-full">
                        {form.progress.percentage}%
                    </progress>
                )}
                <InputError message={form.errors.avatar} />
            </div>
        </>
    );
}

