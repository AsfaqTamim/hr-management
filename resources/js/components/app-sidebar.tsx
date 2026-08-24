import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, BriefcaseBusiness, Building2, Users, CalendarCog, CalendarClock, Clock, CalendarCheck, Receipt, FileBarChart } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { Auth, NavItem } from '@/types';

type Role = Auth['user']['role'];

// Each item lists the roles allowed to see it. Undefined means "everyone".
type GatedNavItem = NavItem & { roles?: Role[] };

const mainNavItems: GatedNavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Departments',
        href: '/departments',
        icon: Building2,
        roles: ['admin', 'hr'],
    },
    {
        title: 'Positions',
        href: '/positions',
        icon: BriefcaseBusiness,
        roles: ['admin', 'hr'],
    },
    {
        title: 'Employees',
        href: '/employees',
        icon: Users,
        roles: ['admin', 'hr','manager'],
    },
    {
        title: 'Leave Types',
        href: '/leave-types',
        icon: CalendarCog,
        roles: ['admin', 'hr'],
    },
    {
        title: 'Leave Requests',
        href: '/leave-requests',
        icon: CalendarClock,
    },
    {
        title: 'Attendance',
        href: '/attendance',
        icon: Clock,
    },
    {
        title: 'Timesheets',
        href: '/timesheets',
        icon: CalendarCheck,
        roles: ['admin', 'hr', 'manager'],
    },
    {
        title: 'Payslips',
        href: '/payslips',
        icon: Receipt,
        roles: ['admin', 'hr'],
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: FileBarChart,
        roles: ['admin', 'hr'],
    },

];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const role = auth.user.role;

    const items = mainNavItems.filter((item) => !item.roles || item.roles.includes(role));

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
