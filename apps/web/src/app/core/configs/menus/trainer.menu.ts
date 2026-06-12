import { NavItem } from "../../models/nav-Item.model";

export const TrainerMenu: NavItem[] = [
    {
        label: 'Dashboard',
        icon: 'fa-solid fa-house',
        route: '/trainer/dashboard',
        roles: ['Trainer']
    },
    {
        label: 'CLIENTS',
        icon: '',
        roles: ['Trainer'],
        isHeading: true
    },
    {
        label: 'PT Members',
        icon: 'fa-solid fa-users',
        route: '/trainer/members',
        roles: ['Trainer']
    },
    {
        label: 'Workout Planner',
        icon: 'fa-solid fa-calendar-check',
        route: '/trainer/workout-planner',
        roles: ['Trainer']
    },
    {
        label: 'Diet Planner',
        icon: 'fa-solid fa-apple-whole',
        route: '/trainer/diet-planner',
        roles: ['Trainer']
    },

    {
        label: 'ACCOUNT',
        icon: '',
        roles: ['Trainer'],
        isHeading: true
    },
    {
        label: 'My Profile',
        icon: 'fa-solid fa-user-circle',
        route: '/trainer/profile',
        roles: ['Trainer']
    },
    {
        label: 'Settings',
        icon: 'fa-solid fa-gear',
        route: '/trainer/settings',
        roles: ['Trainer']
    }
];
