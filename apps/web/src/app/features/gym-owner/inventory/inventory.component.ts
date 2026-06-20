import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DataGrid } from '../../../shared/components/data-grid/data-grid.component';
import { DropdownOption } from '../../../shared/models/dropdown.model';
import { AppGridConfig } from '../../../shared/constants/grid-config';
import { InventoryService } from '../../../core/services/inventory.service';
import { MemberService } from '../../../core/services/member.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { CONSTANTS } from '../../../core/constants/constants';
import { BranchContextService } from '../../../core/services/branch-context.service';
import { ProductDrawerComponent } from './components/product-drawer/product-drawer.component';
import { EquipmentDrawerComponent } from './components/equipment-drawer/equipment-drawer.component';
import { RecordSaleDrawerComponent } from './components/record-sale-drawer/record-sale-drawer.component';
import { MaintenanceDrawerComponent } from './components/maintenance-drawer/maintenance-drawer.component';
import { ProductViewDrawerComponent } from './components/product-view-drawer/product-view-drawer.component';
import { EquipmentViewDrawerComponent } from './components/equipment-view-drawer/equipment-view-drawer.component';
import { MaintenanceViewDrawerComponent } from './components/maintenance-view-drawer/maintenance-view-drawer.component';
import { SaleViewDrawerComponent } from './components/sale-view-drawer/sale-view-drawer.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataGrid,
    ProductDrawerComponent,
    EquipmentDrawerComponent,
    RecordSaleDrawerComponent,
    MaintenanceDrawerComponent,
    ProductViewDrawerComponent,
    EquipmentViewDrawerComponent,
    MaintenanceViewDrawerComponent,
    SaleViewDrawerComponent
  ],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private inventoryService = inject(InventoryService);
  private notificationService = inject(NotificationService);
  private memberService = inject(MemberService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private branchContextService = inject(BranchContextService);
  private confirmationService = inject(ConfirmationService);

  activeTab: 'inventory' | 'equipment' | 'maintenance' | 'sales' = 'inventory';
  equipmentViewMode: 'grid' | 'table' = 'grid';
  pageSize: number = 10;
  currentPage: number = 1;
  totalItems: number = 0;
  loading = false;
  activeStockFilter: 'lowStock' | 'inStock' | null = null;

  // Drawer Opening States
  isProductDrawerOpen = false;
  isEquipmentDrawerOpen = false;
  isSaleDrawerOpen = false;
  isMaintenanceDrawerOpen = false;

  // View Modal Opening States
  isProductViewOpen = false;
  isEquipmentViewOpen = false;
  isMaintenanceViewOpen = false;
  isSaleViewOpen = false;

  // Selected Entities
  selectedProduct: any = null;
  selectedEquipment: any = null;
  selectedMaintenanceLog: any = null;
  selectedSale: any = null;

  searchControl = new FormControl('');

  // Dropdown Options
  productCategories: DropdownOption[] = [
    { label: 'Supplements', value: 'Supplements' },
    { label: 'Apparel', value: 'Apparel' },
    { label: 'Beverages', value: 'Beverages' },
    { label: 'Equipment', value: 'Equipment' },
    { label: 'Accessories', value: 'Accessories' }
  ];

  equipmentCategories: DropdownOption[] = [
    { label: 'Cardio', value: 'Cardio' },
    { label: 'Strength', value: 'Strength' },
    { label: 'Free Weights', value: 'Free Weights' },
    { label: 'Functional', value: 'Functional' }
  ];

  conditionOptions: DropdownOption[] = [
    { label: 'New', value: 'New' },
    { label: 'Excellent', value: 'Excellent' },
    { label: 'Good', value: 'Good' },
    { label: 'Fair', value: 'Fair' }
  ];

  serviceTypeOptions: DropdownOption[] = [
    { label: 'Routine Checkup', value: 'Routine' },
    { label: 'Emergency Repair', value: 'Repair' },
    { label: 'Part Replacement', value: 'Part Replacement' },
    { label: 'Upgrade', value: 'Upgrade' }
  ];

  maintenanceStatusOptions: DropdownOption[] = [
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Scheduled', value: 'Scheduled' }
  ];

  inventoryGridConfig = AppGridConfig['InventoryItems'];
  salesGridConfig = AppGridConfig['SalesHistory'];
  equipmentGridConfig = AppGridConfig['EquipmentItems'];
  maintenanceGridConfig = AppGridConfig['MaintenanceTasks'];
  serviceHistoryGridConfig = AppGridConfig['ServiceHistory'];

  // Data lists
  inventoryItems: any[] = [];
  allInventoryItems: any[] = [];
  equipmentItems: any[] = [];
  allEquipmentItems: any[] = [];
  maintenanceItems: any[] = [];
  salesItems: any[] = [];
  serviceHistoryItems: any[] = [];

  memberOptions: DropdownOption[] = [];
  productOptions: DropdownOption[] = [];

  ngOnInit(): void {
    this.branchContextService.activeBranch$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadData();
    });

    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
      if (params['filter'] === 'lowStock') {
        this.activeStockFilter = 'lowStock';
        this.searchControl.setValue('', { emitEvent: false });
        this.currentPage = 1;
        this.loadProducts();
      } else if (params['filter'] === 'inStock') {
        this.activeStockFilter = 'inStock';
        this.searchControl.setValue('', { emitEvent: false });
        this.currentPage = 1;
        this.loadProducts();
      } else if (params['filter'] === 'maintenance') {
        this.activeStockFilter = null;
        this.equipmentViewMode = 'grid';
        setTimeout(() => {
          this.equipmentItems = this.allEquipmentItems.filter(e => e.health < 70 || e.status === 'Needs Repair');
        }, 500);
      } else {
        this.activeStockFilter = null;
      }
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.currentPage = 1;
      this.triggerActiveTabLoader();
    });
  }

  triggerActiveTabLoader() {
    if (this.activeTab === 'inventory') this.loadProducts();
    else if (this.activeTab === 'equipment') this.loadEquipment();
    else if (this.activeTab === 'maintenance') this.loadServiceHistory();
    else if (this.activeTab === 'sales') this.loadSalesHistory();
  }

  getSearchPlaceholder(): string {
    switch (this.activeTab) {
      case 'inventory': return 'Search inventory...';
      case 'equipment': return 'Search Equipments...';
      case 'maintenance': return 'Search logs...';
      case 'sales': return 'Search Sale history...';
      default: return 'Search...';
    }
  }

  clearSearch() {
    this.searchControl.setValue('');
  }

  loadData() {
    this.loadProducts();
    this.loadEquipment();
    this.loadSalesHistory();
    this.loadMembers();
    this.loadServiceHistory();
  }

  loadMembers() {
    this.memberService.getGymMembers().subscribe({
      next: (res) => {
        const members = res.data?.items || [];
        this.memberOptions = members.map(m => ({
          label: `${m.firstName} ${m.lastName} (${m.membershipNumber})`,
          value: m.id
        }));
      }
    });
  }

  loadProducts() {
    this.loading = true;
    const search = this.searchControl.value || '';
    this.inventoryService.getProducts(this.currentPage, this.pageSize, search, false, this.activeStockFilter ?? undefined).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.inventoryItems = res.data.items || [];
          this.allInventoryItems = [...this.inventoryItems];
          this.totalItems = res.data.totalCount || 0;

          this.productOptions = this.inventoryItems.map(p => ({ label: p.name, value: p.id }));
        }
        this.loading = false;
      },
      error: () => {
        this.notificationService.error(CONSTANTS.INVENTORY_MODULE.LOAD_PRODUCTS_ERROR);
        this.loading = false;
      }
    });
  }

  loadEquipment() {
    this.loading = true;
    const search = this.searchControl.value || '';
    this.inventoryService.getEquipment(this.currentPage, this.pageSize, search).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const equipment = res.data.items || [];
          this.allEquipmentItems = [...equipment];
          this.equipmentItems = [...this.allEquipmentItems];
          this.totalItems = res.data.totalCount || 0;

          this.maintenanceItems = this.allEquipmentItems.filter(item =>
            item.health < 80 || item.status === 'Maintenance' || item.status === 'Needs Repair'
          );
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadSalesHistory() {
    this.loading = true;
    const search = this.searchControl.value || '';
    this.inventoryService.getSalesHistory(this.currentPage, this.pageSize, search).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.salesItems = res.data.items || [];
          this.totalItems = res.data.totalCount || 0;
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadServiceHistory() {
    this.loading = true;
    const search = this.searchControl.value || '';
    this.inventoryService.getMaintenanceHistoryGlobal(this.currentPage, this.pageSize, search).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.serviceHistoryItems = res.data.items || [];
          this.totalItems = res.data.totalCount || 0;
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filterInventory() {
    this.currentPage = 1;
    this.loadProducts();
  }

  clearStockFilter() {
    this.activeStockFilter = null;
    this.currentPage = 1;
    this.loadProducts();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { filter: null },
      queryParamsHandling: 'merge'
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.triggerActiveTabLoader();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.triggerActiveTabLoader();
  }

  setTab(tab: 'inventory' | 'equipment' | 'maintenance' | 'sales') {
    this.activeTab = tab;
    this.currentPage = 1;
    this.searchControl.setValue('', { emitEvent: false });
    this.triggerActiveTabLoader();
  }

  onInventoryAction(event: { action: string, row: any }) {
    if (event.action === 'edit' || event.action === 'service') {
      if (this.activeTab === 'inventory') {
        this.selectedProduct = event.row;
        this.isProductDrawerOpen = true;
      } else if (this.activeTab === 'equipment') {
        this.selectedEquipment = event.row;
        if (event.action === 'service') {
          this.isMaintenanceDrawerOpen = true;
        } else {
          this.isEquipmentDrawerOpen = true;
        }
      } else if (this.activeTab === 'maintenance') {
        if (event.row.status === 'Completed') {
          this.notificationService.info(CONSTANTS.INVENTORY_MODULE.EDIT_COMPLETED_LOGS_INFO);
          return;
        }
        this.selectedMaintenanceLog = event.row;
        this.isMaintenanceDrawerOpen = true;
      }
    } else if (event.action === 'view' || event.action === 'row-click') {
      if (this.activeTab === 'inventory') {
        this.selectedProduct = event.row;
        this.isProductViewOpen = true;
      } else if (this.activeTab === 'equipment') {
        this.selectedEquipment = event.row;
        this.isEquipmentViewOpen = true;
      } else if (this.activeTab === 'maintenance') {
        this.selectedMaintenanceLog = event.row;
        this.isMaintenanceViewOpen = true;
      } else if (this.activeTab === 'sales') {
        this.selectedSale = event.row;
        this.isSaleViewOpen = true;
      }
    } else if (event.action === 'delete') {
      if (this.activeTab === 'inventory') {
        this.deleteProduct(event.row.id);
      }
    } else if (event.action === 'sell') {
      this.selectedProduct = event.row;
      this.isSaleDrawerOpen = true;
    }
  }

  getBadgeClass(status: string): any {
    const s = status?.toLowerCase();
    if (['in stock', 'excellent', 'success', 'active'].includes(s)) return 'badge-success';
    if (['low stock', 'maintenance due', 'pending', 'fair', 'in maintenance'].includes(s)) return 'badge-warning';
    if (['out of stock', 'critical', 'expired', 'repair needed', 'danger'].includes(s)) return 'badge-danger';
    return 'badge-secondary';
  }

  openProductDrawer(product?: any) {
    this.selectedProduct = product || null;
    this.isProductDrawerOpen = true;
  }

  openEquipmentDrawer(equipment?: any) {
    this.selectedEquipment = equipment || null;
    this.isEquipmentDrawerOpen = true;
  }

  openSaleDrawer(product?: any) {
    this.selectedProduct = product || null;
    this.isSaleDrawerOpen = true;
  }

  deleteProduct(id: string) {
    this.confirmationService.confirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    }).then(confirmed => {
      if (confirmed) {
        this.inventoryService.deleteProduct(id).subscribe({
          next: () => {
            this.notificationService.success(CONSTANTS.INVENTORY_MODULE.PRODUCT_DELETE_SUCCESS);
            this.loadProducts();
          }
        });
      }
    });
  }

  onEditProductFromView(product: any) {
    this.isProductViewOpen = false;
    setTimeout(() => {
      this.selectedProduct = product;
      this.isProductDrawerOpen = true;
    }, 150);
  }

  onEditEquipmentFromView(equipment: any) {
    this.isEquipmentViewOpen = false;
    setTimeout(() => {
      this.selectedEquipment = equipment;
      this.isEquipmentDrawerOpen = true;
    }, 150);
  }

  onEditLogFromView(log: any) {
    this.isMaintenanceViewOpen = false;
    setTimeout(() => {
      this.selectedMaintenanceLog = log;
      this.isMaintenanceDrawerOpen = true;
    }, 150);
  }
}
