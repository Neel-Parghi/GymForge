import { NavItem } from "../../core/models/nav-Item.model";

export const MenuConfig: NavItem[] = [
    {
        label: 'Dashboard',
        icon: 'fa-brands fa-dashcube',
        route: '/super-admin/dashboard',
        roles: ['SuperAdmin']
    },
    {
        label: 'Gym Management',
        icon: 'fa-brands fa-maxcdn',
        roles: ['SuperAdmin'],
        children: [
            {
                label: 'Gym List',
                icon: 'fa-solid fa-list-ul',
                route: '/super-admin/gym-list',
                roles: ['SuperAdmin']
            },
            {
                label: 'Gym Owners',
                icon: 'fa-solid fa-user-group',
                route: '/super-admin/gym-owners',
                roles: ['SuperAdmin']
            }
        ]
    },
    {
        label: 'Plan Catalog',
        icon: 'fa-brands fa-buffer',
        route: '/super-admin/plan-catalog',
        roles: ['SuperAdmin'],
    },
    {
        label: 'Settings',
        icon: 'fa-solid fa-gear',
        route: '/super-admin/settings',
        roles: ['SuperAdmin'],
    }
]