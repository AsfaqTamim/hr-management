// ── Shared pagination shape returned by Laravel's paginator ──────────────────

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

export interface SearchFilters {
    search?: string;
}

// ── HR domain models (mirror the Eloquent models on the server) ──────────────

export type Role = 'admin' | 'hr' | 'manager' | 'employee';

export type EmploymentStatus = 'active' | 'on_leave' | 'terminated';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface Department {
    id: number;
    name: string;
    code: string | null;
    description: string | null;
    positions_count?: number;
    employees_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Position {
    id: number;
    department_id: number;
    title: string;
    description: string | null;
    department?: Department;
    employees_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Employee {
    id: number;
    user_id: number | null;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string | null;
    department_id: number | null;
    position_id: number | null;
    manager_id: number | null;
    hire_date: string;
    employment_status: EmploymentStatus;
    salary: string;
    avatar_path: string | null;
    avatar_url?: string | null;
    address: string | null;
    department?: Department | null;
    position?: Position | null;
    manager?: Employee | null;
    created_at: string;
    updated_at: string;
}

export interface LeaveType {
    id: number;
    name: string;
    default_days_per_year: number;
    is_paid: boolean;
}

export interface LeaveBalance {
    id: number;
    employee_id: number;
    leave_type_id: number;
    year: number;
    entitled_days: number;
    used_days: number;
    remaining_days: number;
    leave_type?: LeaveType;
}

export interface LeaveRequest {
    id: number;
    employee_id: number;
    leave_type_id: number;
    start_date: string;
    end_date: string;
    days: number;
    reason: string | null;
    status: LeaveStatus;
    reviewed_by: number | null;
    reviewed_at: string | null;
    review_note: string | null;
    employee?: Employee;
    leave_type?: LeaveType;
}

export interface Attendance {
    id: number;
    employee_id: number;
    work_date: string;
    clock_in: string | null;
    clock_out: string | null;
    status: 'present' | 'late' | 'absent';
    employee?: Employee;
}

export interface Payslip {
    id: number;
    employee_id: number;
    period_start: string;
    period_end: string;
    gross_pay: string;
    deductions: string;
    net_pay: string;
    issued_at: string | null;
    employee?: Employee;
}