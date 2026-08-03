import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import type { Department, Paginated, Position } from '@/types/hr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { BriefcaseBusiness, Pencil, Plus, Search, Trash2, X } from 'lucide-react';

interface Filters {
    search?: string;
    department?: string;
}

interface Props {
    positions: Paginated<Position>;
    departments: Pick<Department, 'id' | 'name'>[];
    filters: Filters;
}

const emptyForm = {
    department_id: '',
    title: '',
    description: '',
};
export default function PositionsIndex({ positions, departments, filters }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<Position | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');

    const createForm = useForm({ ...emptyForm });
    const editForm = useForm({ ...emptyForm });

    function submitCreate(e: FormEvent) {
        e.preventDefault();
        createForm.post('/positions', {
            onSuccess: () => {
                toast.success('Position created.');
                setShowCreate(false);
                createForm.reset();
            },
        });
    }

    function openEdit(position: Position) {
        setEditing(position);
        editForm.setData({
            department_id: String(position.department_id),
            title: position.title,
            description: position.description ?? '',
        });
    }

    function submitEdit(e: FormEvent) {
        e.preventDefault();
        if (!editing) return;
        editForm.patch(`/positions/${editing.id}`, {
            onSuccess: () => {
                toast.success('Position updated.');
                setEditing(null);
            },
        });
    }

    function handleDelete(position: Position) {
        if (!confirm(`Delete "${position.title}"?`)) return;
        router.delete(`/positions/${position.id}`, {
            onSuccess: () => toast.success('Position deleted.'),
        });
    }

    function applyFilters(next: Filters) {
        router.get('/positions', { search: next.search || undefined, department: next.department || undefined }, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="Positions" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Positions</h1>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Position
                    </Button>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                    <form
                        onSubmit={(e) => { e.preventDefault(); applyFilters({ ...filters, search }); }}
                        className="flex gap-2"
                    >
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                placeholder="Search by title…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button type="submit">Search</Button>
                    </form>

                    <select
                        value={filters.department ?? ''}
                        onChange={(e) => applyFilters({ ...filters, department: e.target.value })}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="">All departments</option>
                        {departments.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>

                    {(filters.search || filters.department) && (
                        <Button type="button" variant="ghost" onClick={() => { setSearch(''); applyFilters({}); }}>
                            <X className="mr-1 h-4 w-4" /> Clear
                        </Button>
                    )}
                </div>

                {positions.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                        <BriefcaseBusiness className="mb-3 h-12 w-12 text-muted-foreground" />
                        <p className="font-semibold">No positions found</p>
                        <p className="mt-1 text-sm text-muted-foreground">Add job titles so you can assign them to employees.</p>
                        <Button className="mt-4" onClick={() => setShowCreate(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Position
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="rounded-xl border">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/40">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Title</th>
                                        <th className="px-4 py-3 text-left font-medium">Department</th>
                                        <th className="px-4 py-3 text-right font-medium">Employees</th>
                                        <th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {positions.data.map((position) => (
                                        <tr key={position.id} className="hover:bg-muted/20">
                                            <td className="px-4 py-3 font-medium">{position.title}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{position.department?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-right">{position.employees_count ?? 0}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEdit(position)} className="text-muted-foreground hover:text-foreground" title="Edit">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(position)} className="text-muted-foreground hover:text-destructive" title="Delete">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {positions.last_page > 1 && (
                            <div className="mt-4 flex justify-center gap-1">
                                {positions.links.map((link, i) =>
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`rounded px-3 py-1.5 text-sm ${link.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
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
                    <DialogHeader>
                        <DialogTitle>Add Position</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <PositionFormFields form={createForm} departments={departments} />
                        <div className="flex justify-end gap-2 pt-1">
                            <Button type="button" variant="outline" onClick={() => { setShowCreate(false); createForm.reset(); }}>Cancel</Button>
                            <Button type="submit" disabled={createForm.processing}>{createForm.processing ? 'Creating…' : 'Create'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Position</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <PositionFormFields form={editForm} departments={departments} />
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

function PositionFormFields({
    form,
    departments,
}: {
    form: ReturnType<typeof useForm<typeof emptyForm>>;
    departments: Pick<Department, 'id' | 'name'>[];
}) {
    return (
        <>
            <div>
                <Label htmlFor="p-dept">Department</Label>
                <select
                    id="p-dept"
                    value={form.data.department_id}
                    onChange={(e) => form.setData('department_id', e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                    <option value="">Select a department…</option>
                    {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
                <InputError message={form.errors.department_id} />
            </div>

            <div>
                <Label htmlFor="p-title">Title</Label>
                <Input id="p-title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} autoFocus />
                <InputError message={form.errors.title} />
            </div>

            <div>
                <Label htmlFor="p-desc">Description</Label>
                <textarea
                    id="p-desc"
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

PositionsIndex.layout = { breadcrumbs: [{ title: 'Positions', href: '/positions' }] };
