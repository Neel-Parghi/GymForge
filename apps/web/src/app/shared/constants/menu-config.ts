import { NavItem } from "../../core/models/nav-Item.model";

export const MenuConfig: NavItem[] = [
    {
        label: 'Dashboard',
        icon: 'fa-solid fa-house',
        route: '/super-admin/dashboard',
        roles: ['SuperAdmin']
    },
    {
        label: 'GYM MANAGEMENT',
        icon: '',
        roles: ['SuperAdmin'],
        isHeading: true
    },
    {
        label: 'Gym Owners',
        icon: 'fa-solid fa-user-group',
        route: '/super-admin/gym-owners',
        roles: ['SuperAdmin']
    },
    {
        label: 'Gym List',
        icon: 'fa-solid fa-list-ul',
        route: '/super-admin/gym-list',
        roles: ['SuperAdmin']
    },
    {
        label: 'FINANCIALS',
        icon: '',
        roles: ['SuperAdmin'],
        isHeading: true
    },
    {
        label: 'Payments',
        icon: 'fa-solid fa-credit-card',
        route: '/super-admin/payments',
        roles: ['SuperAdmin']
    },
    {
        label: 'Plans',
        icon: 'fa-solid fa-tags',
        route: '/super-admin/pricing',
        roles: ['SuperAdmin'],
    },
    {
        label: 'ACCOUNT',
        icon: '',
        roles: ['SuperAdmin'],
        isHeading: true
    },
    {
        label: 'My Profile',
        icon: 'fa-solid fa-user-circle',
        route: '/super-admin/profile',
        roles: ['SuperAdmin']
    },
    {
        label: 'Settings',
        icon: 'fa-solid fa-gear',
        route: '/super-admin/settings',
        roles: ['SuperAdmin'],
    },
    // --- GYM OWNER MENU ---
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
        label: 'My Gyms',
        icon: 'fa-solid fa-building',
        route: '/gym-owner/my-gyms',
        roles: ['GymOwner']
    },
    {
        label: 'Members',
        icon: 'fa-solid fa-users',
        route: '/gym-owner/members',
        roles: ['GymOwner']
    },
    {
        label: 'Staff',
        icon: 'fa-solid fa-user-tie',
        route: '/gym-owner/staff',
        roles: ['GymOwner']
    },
    {
        label: 'Internal Plans',
        icon: 'fa-solid fa-receipt',
        route: '/gym-owner/plans',
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