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
        label: 'Settings',
        icon: 'fa-solid fa-gear',
        route: '/super-admin/settings',
        roles: ['SuperAdmin'],
    }
]