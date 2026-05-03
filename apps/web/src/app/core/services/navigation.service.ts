import { inject, Injectable } from "@angular/core";
import { AuthApiService } from "./auth-api.service";
import { NavItem } from "../models/nav-Item.model";
import { SuperAdminMenu } from "../configs/menus/super-admin.menu";
import { GymOwnerMenu } from "../configs/menus/gym-owner.menu";

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private authService = inject(AuthApiService);

    getMenuItems(): NavItem[] {
        const userRole = this.authService.getUserRole();
        
        let config: NavItem[] = [];
        
        switch (userRole) {
            case 'SuperAdmin':
                config = SuperAdminMenu;
                break;
            case 'GymOwner':
                config = GymOwnerMenu;
                break;
            default:
                config = [];
        }

        return this.filterByRole(config, userRole);
    }

    private filterByRole(menuItems: NavItem[], role: string | null): NavItem[] {
        if (!role) return [];

        return menuItems.filter(item => item.roles.includes(role))
            .map(item => ({
                ...item,
                children: item.children ? this.filterByRole(item.children, role) : []
            }))
    }
}