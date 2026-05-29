import { inject, Injectable } from "@angular/core";
import { AuthApiService } from "./auth-api.service";
import { GymSettingsService } from "./gym-settings.service";
import { NavItem } from "../models/nav-Item.model";
import { SuperAdminMenu } from "../configs/menus/super-admin.menu";
import { GymOwnerMenu } from "../configs/menus/gym-owner.menu";

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private authService = inject(AuthApiService);
    private settingsService = inject(GymSettingsService);

    getMenuItems(): NavItem[] {
        const userRole = this.authService.getUserRole();

        let config: NavItem[] = [];

        switch (userRole) {
            case 'SuperAdmin':
                config = SuperAdminMenu;
                break;
            case 'GymOwner':
            case 'Staff':
            case 'Trainer':
                config = GymOwnerMenu;
                break;
            default:
                config = [];
        }

        const cachedSettings = this.settingsService.getSettingsSync();
        const savedRights = cachedSettings?.roleRights || {};

        return this.filterByRole(config, userRole, savedRights);
    }

    private filterByRole(menuItems: NavItem[], role: string | null, savedRights: any = {}): NavItem[] {
        if (!role) return [];

        const moduleMap: { [key: string]: string } = {
            '/gym-owner/dashboard': 'dashboard',
            '/gym-owner/members': 'members',
            '/gym-owner/attendance': 'attendance',
            '/gym-owner/staff': 'staff',
            '/gym-owner/plans': 'plans',
            '/gym-owner/inventory': 'inventory',
            '/gym-owner/billing': 'billing'
        };

        // Filter basic role array checking first
        let filtered = menuItems.filter(item => {
            if (!item.roles.includes(role)) return false;

            // Enforce owner-only restrictions for configuration pages
            if (item.route === '/gym-owner/my-gyms' && role !== 'GymOwner') {
                return false;
            }
            if (item.route === '/gym-owner/settings' && role !== 'GymOwner') {
                return false;
            }

            // Map standard route to modular matrix key
            if (item.route && moduleMap[item.route]) {
                const modKey = moduleMap[item.route];
                const matrixKey = `${role}_${modKey}`;

                // Get the permission from matrix (if not found in matrix, fall back to defaults)
                let defaultValue = true;
                if (role === 'Trainer') {
                    defaultValue = modKey === 'dashboard' || modKey === 'members' || modKey === 'attendance';
                } else if (role === 'Staff') {
                    defaultValue = modKey === 'dashboard' || modKey === 'members' || modKey === 'attendance' || modKey === 'inventory';
                }

                const hasAccess = savedRights[matrixKey] !== undefined ? savedRights[matrixKey] : defaultValue;
                if (!hasAccess) {
                    return false;
                }
            }

            return true;
        });

        filtered = filtered.map(item => ({
            ...item,
            children: item.children ? this.filterByRole(item.children, role, savedRights) : []
        }));

        const result: NavItem[] = [];
        for (let i = 0; i < filtered.length; i++) {
            const current = filtered[i];
            if (current.isHeading) {
                let hasFollowers = false;
                for (let j = i + 1; j < filtered.length; j++) {
                    if (filtered[j].isHeading) {
                        break;
                    }
                    if (filtered[j].route) {
                        hasFollowers = true;
                        break;
                    }
                }
                if (hasFollowers) {
                    result.push(current);
                }
            } else {
                result.push(current);
            }
        }

        return result;
    }
}