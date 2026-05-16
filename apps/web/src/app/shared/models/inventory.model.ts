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
}