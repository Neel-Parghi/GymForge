export interface NavItem {
    label: string;
    icon: string;
    link?: string;
    route?: string;
    children?: NavItem[];
    expanded?: boolean;
    roles: string[];
    isHeading?: boolean;
}