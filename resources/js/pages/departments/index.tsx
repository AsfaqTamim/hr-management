import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import type { Department, Paginated, SearchFilters } from '@/types/hr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { Building2, Pencil, Plus, Search, Trash2, X } from 'lucide-react';

interface Props {
    departments: Paginated<Department>;
    filters: SearchFilters;
}

const emptyForm = {
    name: '',
    code: '',
    description: '',
};

export default function DepartmentsIndex({ departments, filters }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<Department | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');

    const createForm = useForm({ ...emptyForm });
    const editForm = useForm({ ...emptyForm });

    function submitCreate(e: FormEvent) {
        e.preventDefault();
        createForm.post('/departments', {
            onSuccess: () => {
                toast.success('Department created.');
                setShowCreate(false);
                createForm.reset();
            },
        });
    }

    function openEdit(department: Department) {
        setEditing(department);
        editForm.setData({
            name: department.name,
            code: department.code ?? '',
            description: department.description ?? '',
        });
    }

    function submitEdit(e: FormEvent) {
        e.preventDefault();
        if (!editing) return;
        editForm.patch(`/departments/${editing.id}`, {
            onSuccess: () => {
                toast.success('Department updated.');
                setEditing(null);
            },
        });
    }

    function handleDelete(department: Department) {
        if (!confirm(`Delete "${department.name}"? Its positions will be removed too.`)) return;
        router.delete(`/departments/${department.id}`, {
            onSuccess: () => toast.success('Department deleted.'),
        });
    }

    function submitSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/departments', { search: search || undefined }, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function clearSearch() {
        setSearch('');
        router.get('/departments', {}, { preserveState: true });
    }

    return (
        <>
            <Head title="Departments" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Departments</h1>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Department
                    </Button>
                </div>

                <form onSubmit={submitSearch} className="mb-4 flex gap-2">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Search by name or code…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button type="submit">Search</Button>
                    {filters.search && (
                        <Button type="button" variant="ghost" onClick={clearSearch}>
                            <X className="mr-1 h-4 w-4" /> Clear
                        </Button>
                    )}
                </form>

                {departments.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                        <Building2 className="mb-3 h-12 w-12 text-muted-foreground" />
                        <p className="font-semibold">No departments yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">Create your first department to organise the company.</p>
                        <Button className="mt-4" onClick={() => setShowCreate(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Department
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="rounded-xl border">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/40">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Name</th>
                                        <th className="px-4 py-3 text-left font-medium">Code</th>
                                        <th className="px-4 py-3 text-right font-medium">Positions</th>
                                        <th className="px-4 py-3 text-right font-medium">Employees</th>
                                        <th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {departments.data.map((department) => (
                                        <tr key={department.id} className="hover:bg-muted/20">
                                            <td className="px-4 py-3 font-medium">{department.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{department.code ?? '—'}</td>
                                            <td className="px-4 py-3 text-right">{department.positions_count ?? 0}</td>
                                            <td className="px-4 py-3 text-right">{department.employees_count ?? 0}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(department)}
                                                        className="text-muted-foreground hover:text-foreground"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(department)}
                                                        className="text-muted-foreground hover:text-destructive"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {departments.last_page > 1 && (
                            <div className="mt-4 flex justify-center gap-1">
                                {departments.links.map((link, i) =>
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`rounded px-3 py-1.5 text-sm ${link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="rounded px-3 py-1.5 text-sm opacity-40"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ),
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            <Dialog open={showCreate} onOpenChange={(open) => { if (!open) { setShowCreate(false); createForm.reset(); } }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Department</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <DepartmentFormFields form={createForm} />
                        <div className="flex justify-end gap-2 pt-1">
                            <Button type="button" variant="outline" onClick={() => { setShowCreate(false); createForm.reset(); }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                {createForm.processing ? 'Creating…' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Department</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <DepartmentFormFields form={editForm} />
                        <div className="flex justify-end gap-2 pt-1">
                            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Saving…' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );

}

function DepartmentFormFields({ form }: { form: ReturnType<typeof useForm<typeof emptyForm>> }) {
    return (
        <>
            <div>
                <Label htmlFor="d-name">Name</Label>
                <Input
                    id="d-name"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    autoFocus
                />
                <InputError message={form.errors.name} />
            </div>

            <div>
                <Label htmlFor="d-code">Code</Label>
                <Input
                    id="d-code"
                    value={form.data.code}
                    onChange={(e) => form.setData('code', e.target.value)}
                    placeholder="e.g. ENG"
                />
                <InputError message={form.errors.code} />
            </div>

            <div>
                <Label htmlFor="d-desc">Description</Label>
                <textarea
                    id="d-desc"
                    rows={3}
                    value={form.data.description}
                    onChange={(e) => form.setData('description', e.target.value)}
                    placeholder="Optional description…"
                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <InputError message={form.errors.description} />
            </div>
        </>
    );
}

DepartmentsIndex.layout = { breadcrumbs: [{ title: 'Departments', href: '/departments' }] };