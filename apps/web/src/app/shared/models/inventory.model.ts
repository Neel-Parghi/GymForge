export interface InventoryItem {
    id: string;
    name: string;
    sku: string;
    category: string;
    buyingPrice: number;
    sellingPrice: number;
    stockQuantity: number;
    reorderLevel: number;
    imageUrl?: string;
    description?: string;
    branchId?: string;
    stockStatus: 'Out of Stock' | 'Low Stock' | 'In Stock';
}

export interface CreateProductRequest {
    name: string;
    sku: string;
    category: string;
    buyingPrice: number;
    sellingPrice: number;
    stockQuantity: number;
    reorderLevel: number;
    imageUrl?: string;
    description?: string;
    branchId?: string;
}

export interface Equipment {
    id: string;
    name: string;
    serialNumber: string;
    category: string;
    condition: string;
    health: number;
    purchaseDate: string;
    warrantyExpiry?: string;
    lastService?: string;
    status: 'Expired' | 'Pending' | 'Success';
    branchId?: string;
}

export interface CreateEquipmentRequest {
    name: string;
    serialNumber: string;
    category: string;
    purchaseDate: string;
    warrantyExpiry?: string;
    condition: string;
    maintenanceInterval: number;
    initialHealth: number;
    imageUrl?: string;
    branchId?: string;
}

export interface SaleTransaction {
    id: string;
    memberName: string;
    memberId: string;
    productName: string;
    quantity: number;
    totalAmount: number;
    date: string;
    paymentMethod: string;
    branchId?: string;
}

export interface RecordSaleDto {
    memberId: string;
    productId: string;
    quantity: number;
    paymentMethod: string;
}

export interface LogMaintenanceDto {
    id?: string;
    equipmentId: string;
    serviceType: string;
    description: string;
    technicianName: string;
    startDate: string | Date;
    estimatedEndDate?: string | Date;
    completedDate?: string | Date;
    cost: number;
    status: string;
    notes?: string;
}

export interface MaintenanceLogDto {
    id: string;
    equipmentId: string;
    equipmentName: string;
    serviceType: string;
    description: string;
    technicianName: string;
    startDate: string | Date;
    estimatedEndDate?: string | Date;
    completedDate?: string | Date;
    cost: number;
    status: string;
    notes?: string;
}

export interface CategoryStatDto {
    category: string;
    count: number;
    value: number;
}

export interface TopProductDto {
    name: string;
    totalSold: number;
    totalRevenue: number;
}

export interface UpcomingMaintenanceDto {
    equipmentName: string;
    scheduledDate?: string | Date;
    healthPercentage: number;
}

export interface InventoryStatsDto {
    totalProducts: number;
    lowStockCount: number;
    maintenanceDueCount: number;
    todaySalesAmount: number;
    todaySalesCount: number;
    totalSalesAmount: number;
    totalSalesCount: number;
    categoryBreakdown: CategoryStatDto[];
    recentSales: SaleTransaction[];
    topProducts: TopProductDto[];
    upcomingMaintenance: UpcomingMaintenanceDto[];
}