import { inject, Injectable } from "@angular/core";
import { AuthApiService } from "./auth-api.service";
import { NavItem } from "../models/nav-Item.model";
import { MenuConfig } from "../../shared/constants/menu-config";

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private authService = inject(AuthApiService);

    getMenuItems() {
        const userRole = this.authService.getUserRole();
        return this.filterByRole(MenuConfig, userRole);
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