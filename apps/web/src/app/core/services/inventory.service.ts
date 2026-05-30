import { Injectable, inject } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { Observable, shareReplay, tap } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { PagedResponse } from '../../shared/models/paged-response.model';
import { InventoryItem, Equipment, SaleTransaction, CreateProductRequest, CreateEquipmentRequest } from '../../shared/models/inventory.model';
import { BranchContextService } from './branch-context.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryService extends BaseApiService {

  private branchContextService = inject(BranchContextService);

  private productsCache$: Observable<ApiResponse<PagedResponse<InventoryItem>>> | null = null;
  private equipmentCache$: Observable<ApiResponse<Equipment[]>> | null = null;
  private salesCache$: Observable<ApiResponse<SaleTransaction[]>> | null = null;
  private maintenanceHistoryCache$: Observable<ApiResponse<any[]>> | null = null;
  private statsCache$: Observable<ApiResponse<any>> | null = null;

  constructor() {
    super();
    this.branchContextService.activeBranch$.subscribe(() => {
      this.clearProductCache();
      this.clearEquipmentCache();
      this.clearSalesCache();
      this.clearMaintenanceCache();
    });
  }

  getProducts(page: number = 1, pageSize: number = 10, search: string = '', forceRefresh = false, stockStatus?: 'lowStock' | 'inStock'): Observable<ApiResponse<PagedResponse<InventoryItem>>> {
    const branchId = this.branchContextService.getActiveBranchId();
    if (search || page !== 1 || pageSize !== 10 || forceRefresh || stockStatus) {
      const params: any = { pageNumber: page, pageSize };
      if (search) params.searchTerm = search;
      if (branchId) params.branchId = branchId;
      if (stockStatus === 'lowStock') params.stockStatus = 'LowStock';
      if (stockStatus === 'inStock') params.stockStatus = 'InStock';
      return this.get<ApiResponse<PagedResponse<InventoryItem>>>(API_CONSTANTS.INVENTORY.PRODUCTS, params);
    }

    if (!this.productsCache$) {
      const params: any = { pageNumber: 1, pageSize: 10 };
      if (branchId) params.branchId = branchId;
      this.productsCache$ = this.get<ApiResponse<PagedResponse<InventoryItem>>>(API_CONSTANTS.INVENTORY.PRODUCTS, params).pipe(
        shareReplay(1)
      );
    }
    return this.productsCache$;
  }

  addProduct(payload: CreateProductRequest): Observable<ApiResponse<InventoryItem>> {
    const branchId = this.branchContextService.getActiveBranchId();
    if (branchId && !payload.branchId) {
      payload.branchId = branchId;
    }
    return this.post<ApiResponse<InventoryItem>>(API_CONSTANTS.INVENTORY.PRODUCTS, payload).pipe(
      tap(() => this.clearProductCache())
    );
  }

  updateProduct(id: string, payload: CreateProductRequest): Observable<ApiResponse<any>> {
    const branchId = this.branchContextService.getActiveBranchId();
    if (branchId && !payload.branchId) {
      payload.branchId = branchId;
    }
    return this.put<ApiResponse<any>>(`${API_CONSTANTS.INVENTORY.PRODUCTS}/${id}`, payload).pipe(
      tap(() => this.clearProductCache())
    );
  }

  deleteProduct(id: string): Observable<ApiResponse<any>> {
    return this.delete<ApiResponse<any>>(`${API_CONSTANTS.INVENTORY.PRODUCTS}/${id}`).pipe(
      tap(() => this.clearProductCache())
    );
  }

  getEquipment(forceRefresh = false): Observable<ApiResponse<Equipment[]>> {
    const branchId = this.branchContextService.getActiveBranchId();
    if (forceRefresh) {
      const params: any = {};
      if (branchId) params.branchId = branchId;
      return this.get<ApiResponse<Equipment[]>>(API_CONSTANTS.INVENTORY.EQUIPMENT, params);
    }

    if (!this.equipmentCache$) {
      const params: any = {};
      if (branchId) params.branchId = branchId;
      this.equipmentCache$ = this.get<ApiResponse<Equipment[]>>(API_CONSTANTS.INVENTORY.EQUIPMENT, params).pipe(
        shareReplay(1)
      );
    }
    return this.equipmentCache$;
  }

  addEquipment(payload: CreateEquipmentRequest): Observable<ApiResponse<Equipment>> {
    const branchId = this.branchContextService.getActiveBranchId();
    if (branchId && !payload.branchId) {
      payload.branchId = branchId;
    }
    return this.post<ApiResponse<Equipment>>(API_CONSTANTS.INVENTORY.EQUIPMENT, payload).pipe(
      tap(() => this.clearEquipmentCache())
    );
  }

  updateEquipment(id: string, payload: CreateEquipmentRequest): Observable<ApiResponse<any>> {
    const branchId = this.branchContextService.getActiveBranchId();
    if (branchId && !payload.branchId) {
      payload.branchId = branchId;
    }
    return this.put<ApiResponse<any>>(`${API_CONSTANTS.INVENTORY.EQUIPMENT}/${id}`, payload).pipe(
      tap(() => this.clearEquipmentCache())
    );
  }

  recordSale(payload: any): Observable<ApiResponse<any>> {
    return this.post<ApiResponse<any>>(API_CONSTANTS.INVENTORY.SALES, payload).pipe(
      tap(() => {
        this.clearProductCache();
        this.clearSalesCache();
      })
    );
  }

  getSalesHistory(forceRefresh = false): Observable<ApiResponse<SaleTransaction[]>> {
    const branchId = this.branchContextService.getActiveBranchId();
    if (forceRefresh) {
      const params: any = {};
      if (branchId) params.branchId = branchId;
      return this.get<ApiResponse<SaleTransaction[]>>(API_CONSTANTS.INVENTORY.SALES_HISTORY, params);
    }

    if (!this.salesCache$) {
      const params: any = {};
      if (branchId) params.branchId = branchId;
      this.salesCache$ = this.get<ApiResponse<SaleTransaction[]>>(API_CONSTANTS.INVENTORY.SALES_HISTORY, params).pipe(
        shareReplay(1)
      );
    }
    return this.salesCache$;
  }

  sendReceiptEmail(saleId: string): Observable<ApiResponse<any>> {
    return this.post<ApiResponse<any>>(`${API_CONSTANTS.INVENTORY.SALES}/${saleId}/receipt`, {});
  }

  logMaintenance(payload: any): Observable<ApiResponse<any>> {
    return this.post<ApiResponse<any>>(API_CONSTANTS.INVENTORY.MAINTENANCE, payload).pipe(
      tap(() => {
        this.clearEquipmentCache();
        this.clearMaintenanceCache();
      })
    );
  }

  updateMaintenance(id: string, payload: any): Observable<ApiResponse<any>> {
    return this.put<ApiResponse<any>>(`${API_CONSTANTS.INVENTORY.MAINTENANCE}/${id}`, payload).pipe(
      tap(() => {
        this.clearEquipmentCache();
        this.clearMaintenanceCache();
      })
    );
  }

  private maintenanceByEquipmentCache = new Map<string, Observable<ApiResponse<any[]>>>();

  getMaintenanceHistory(equipmentId: string, forceRefresh = false): Observable<ApiResponse<any[]>> {
    if (!this.maintenanceByEquipmentCache.has(equipmentId) || forceRefresh) {
      const call = this.get<ApiResponse<any[]>>(`${API_CONSTANTS.INVENTORY.MAINTENANCE}/equipment/${equipmentId}/maintenance`).pipe(
        shareReplay(1)
      );
      this.maintenanceByEquipmentCache.set(equipmentId, call);
    }
    return this.maintenanceByEquipmentCache.get(equipmentId)!;
  }

  getMaintenanceHistoryGlobal(forceRefresh = false): Observable<ApiResponse<any[]>> {
    const branchId = this.branchContextService.getActiveBranchId();
    if (forceRefresh) {
      const params: any = {};
      if (branchId) params.branchId = branchId;
      return this.get<ApiResponse<any[]>>(API_CONSTANTS.INVENTORY.MAINTENANCE_HISTORY, params);
    }

    if (!this.maintenanceHistoryCache$) {
      const params: any = {};
      if (branchId) params.branchId = branchId;
      this.maintenanceHistoryCache$ = this.get<ApiResponse<any[]>>(API_CONSTANTS.INVENTORY.MAINTENANCE_HISTORY, params).pipe(
        shareReplay(1)
      );
    }
    return this.maintenanceHistoryCache$;
  }

  getStats(forceRefresh = false): Observable<ApiResponse<any>> {
    const branchId = this.branchContextService.getActiveBranchId();
    if (forceRefresh) {
      const params: any = {};
      if (branchId) params.branchId = branchId;
      return this.get<ApiResponse<any>>(API_CONSTANTS.INVENTORY.STATS, params);
    }

    if (!this.statsCache$) {
      const params: any = {};
      if (branchId) params.branchId = branchId;
      this.statsCache$ = this.get<ApiResponse<any>>(API_CONSTANTS.INVENTORY.STATS, params).pipe(
        shareReplay(1)
      );
    }
    return this.statsCache$;
  }

  private clearProductCache(): void {
    this.productsCache$ = null;
    this.clearStatsCache();
  }

  private clearEquipmentCache(): void {
    this.equipmentCache$ = null;
    this.clearStatsCache();
  }

  private clearSalesCache(): void {
    this.salesCache$ = null;
    this.clearStatsCache();
  }

  private clearMaintenanceCache(): void {
    this.maintenanceHistoryCache$ = null;
    this.maintenanceByEquipmentCache.clear();
    this.clearStatsCache();
  }

  private clearStatsCache(): void {
    this.statsCache$ = null;
  }
}
