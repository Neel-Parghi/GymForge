import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { Observable, shareReplay, tap } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { PagedResponse } from '../../shared/models/paged-response.model';
import { InventoryItem, Equipment, SaleTransaction, CreateProductRequest, CreateEquipmentRequest } from '../../shared/models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService extends BaseApiService {

  private productsCache$: Observable<ApiResponse<PagedResponse<InventoryItem>>> | null = null;
  private equipmentCache$: Observable<ApiResponse<Equipment[]>> | null = null;
  private salesCache$: Observable<ApiResponse<SaleTransaction[]>> | null = null;
  private maintenanceHistoryCache$: Observable<ApiResponse<any[]>> | null = null;
  private statsCache$: Observable<ApiResponse<any>> | null = null;

  getProducts(page: number = 1, pageSize: number = 10, search: string = '', forceRefresh = false): Observable<ApiResponse<PagedResponse<InventoryItem>>> {
    if (search || page !== 1 || pageSize !== 10 || forceRefresh) {
      const params = `?pageNumber=${page}&pageSize=${pageSize}&searchTerm=${encodeURIComponent(search)}`;
      return this.get<ApiResponse<PagedResponse<InventoryItem>>>(API_CONSTANTS.INVENTORY.PRODUCTS + params);
    }

    if (!this.productsCache$) {
      this.productsCache$ = this.get<ApiResponse<PagedResponse<InventoryItem>>>(`${API_CONSTANTS.INVENTORY.PRODUCTS}?pageNumber=1&pageSize=10`).pipe(
        shareReplay(1)
      );
    }
    return this.productsCache$;
  }

  addProduct(payload: CreateProductRequest): Observable<ApiResponse<InventoryItem>> {
    return this.post<ApiResponse<InventoryItem>>(API_CONSTANTS.INVENTORY.PRODUCTS, payload).pipe(
      tap(() => this.clearProductCache())
    );
  }

  updateProduct(id: string, payload: CreateProductRequest): Observable<ApiResponse<any>> {
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
    if (!this.equipmentCache$ || forceRefresh) {
      this.equipmentCache$ = this.get<ApiResponse<Equipment[]>>(API_CONSTANTS.INVENTORY.EQUIPMENT).pipe(shareReplay(1));
    }
    return this.equipmentCache$;
  }

  addEquipment(payload: CreateEquipmentRequest): Observable<ApiResponse<Equipment>> {
    return this.post<ApiResponse<Equipment>>(API_CONSTANTS.INVENTORY.EQUIPMENT, payload).pipe(
      tap(() => this.clearEquipmentCache())
    );
  }

  updateEquipment(id: string, payload: CreateEquipmentRequest): Observable<ApiResponse<any>> {
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
    if (!this.salesCache$ || forceRefresh) {
      this.salesCache$ = this.get<ApiResponse<SaleTransaction[]>>(API_CONSTANTS.INVENTORY.SALES_HISTORY).pipe(shareReplay(1));
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
    if (!this.maintenanceHistoryCache$ || forceRefresh) {
      this.maintenanceHistoryCache$ = this.get<ApiResponse<any[]>>(API_CONSTANTS.INVENTORY.MAINTENANCE_HISTORY).pipe(shareReplay(1));
    }
    return this.maintenanceHistoryCache$;
  }

  getStats(forceRefresh = false): Observable<ApiResponse<any>> {
    if (!this.statsCache$ || forceRefresh) {
      this.statsCache$ = this.get<ApiResponse<any>>(API_CONSTANTS.INVENTORY.STATS).pipe(shareReplay(1));
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
