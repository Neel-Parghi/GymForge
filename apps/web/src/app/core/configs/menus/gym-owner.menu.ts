import { NavItem } from "../../models/nav-Item.model";

export const GymOwnerMenu: NavItem[] = [
    {
        label: 'Dashboard',
        icon: 'fa-solid fa-house',
        route: '/gym-owner/dashboard',
        roles: ['GymOwner']
    },
    {
        label: 'MANAGEMENT',
        icon: '',
        roles: ['GymOwner'],
        isHeading: true
    },
    {
        label: 'Members',
        icon: 'fa-solid fa-users',
        route: '/gym-owner/members',
        roles: ['GymOwner']
    },
    {
        label: 'Attendance',
        icon: 'fa-solid fa-calendar-check',
        route: '/gym-owner/attendance',
        roles: ['GymOwner']
    },
    {
        label: 'Staff & Trainers',
        icon: 'fa-solid fa-user-tie',
        route: '/gym-owner/staff',
        roles: ['GymOwner']
    },
    {
        label: 'Gym Plans',
        icon: 'fa-solid fa-receipt',
        route: '/gym-owner/plans',
        roles: ['GymOwner']
    },
    {
        label: 'RESOURCES',
        icon: '',
        roles: ['GymOwner'],
        isHeading: true
    },
    {
        label: 'Inventory',
        icon: 'fa-solid fa-boxes-stacked',
        route: '/gym-owner/inventory',
        roles: ['GymOwner']
    },
    {
        label: 'My Gyms',
        icon: 'fa-solid fa-building',
        route: '/gym-owner/my-gyms',
        roles: ['GymOwner']
    },
    {
        label: 'FINANCES',
        icon: '',
        roles: ['GymOwner'],
        isHeading: true
    },
    {
        label: 'Billing & Invoices',
        icon: 'fa-solid fa-file-invoice-dollar',
        route: '/gym-owner/billing',
        roles: ['GymOwner']
    },
    {
        label: 'ACCOUNT',
        icon: '',
        roles: ['GymOwner'],
        isHeading: true
    },
    {
        label: 'My Profile',
        icon: 'fa-solid fa-user-circle',
        route: '/gym-owner/profile',
        roles: ['GymOwner']
    },
    {
        label: 'Settings',
        icon: 'fa-solid fa-gear',
        route: '/gym-owner/settings',
        roles: ['GymOwner']
    }
];
