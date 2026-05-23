import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { DataGrid } from '../../../shared/components/data-grid/data-grid.component';
import { SlideDrawerComponent } from '../../../shared/components/slide-drawer/slide-drawer.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { DateTimePickerComponent } from '../../../shared/components/date-time-picker/date-time-picker.component';
import { DropdownOption } from '../../../shared/models/dropdown.model';
import { AppGridConfig } from '../../../shared/constants/grid-config';
import { InventoryService } from '../../../core/services/inventory.service';
import { MemberService } from '../../../core/services/member.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { BranchContextService } from '../../../core/services/branch-context.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DataGrid, SlideDrawerComponent, DropdownComponent, DateTimePickerComponent],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private inventoryService = inject(InventoryService);
  private notificationService = inject(NotificationService);
  private memberService = inject(MemberService);
  private fileUploadService = inject(FileUploadService);
  private route = inject(ActivatedRoute);
  private branchContextService = inject(BranchContextService);

  activeTab: 'inventory' | 'equipment' | 'maintenance' | 'sales' = 'inventory';
  viewMode: 'list' | 'dashboard' = 'list';
  equipmentViewMode: 'grid' | 'table' = 'grid';
  pageSize: number = 10;
  currentPage: number = 1;
  totalItems: number = 0;
  loading = false;

  // Drawer & View States
  isProductDrawerOpen = false;
  isEditingProduct = false;
  selectedProductId: string | null = null;
  isProductViewOpen = false;
  selectedProduct: any = null;

  isEquipmentDrawerOpen = false;
  isEditingEquipment = false;
  selectedEquipmentId: string | null = null;
  isEquipmentViewOpen = false;
  isMaintenanceDrawerOpen = false;
  isMaintenanceViewOpen = false;
  maintenanceForm!: FormGroup;
  maintenanceHistory: any[] = [];
  selectedMaintenanceLog: any = null;

  selectedEquipment: any = null;

  isSaleDrawerOpen = false;
  isSaleViewOpen = false;
  selectedSale: any = null;

  searchControl = new FormControl('');

  // Reactive Forms
  productForm!: FormGroup;
  equipmentForm!: FormGroup;
  saleForm!: FormGroup;

  // File Upload Staging
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  selectedSaleProduct: any = null;
  saleTotal: number = 0;

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
  stats: any = {
    totalProducts: 0,
    lowStockCount: 0,
    maintenanceDueCount: 0,
    todaySalesAmount: 0,
    todaySalesCount: 0,
    totalSalesAmount: 0,
    totalSalesCount: 0
  };

  constructor() { }

  ngOnInit(): void {
    this.initForms();

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
        this.searchControl.setValue('');
        setTimeout(() => {
          this.inventoryItems = this.allInventoryItems.filter(p => p.stockQuantity <= p.reorderLevel);
        }, 500);
      } else if (params['filter'] === 'maintenance') {
        this.equipmentViewMode = 'grid';
        setTimeout(() => {
          this.equipmentItems = this.allEquipmentItems.filter(e => e.health < 70 || e.status === 'Needs Repair');
        }, 500);
      }
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadProducts();
    });
  }

  private loadData() {
    this.loadProducts();
    this.loadEquipment();
    this.loadSalesHistory();
    this.loadMembers();
    this.loadServiceHistory();
    this.loadStats();
  }

  loadStats() {
    this.inventoryService.getStats().subscribe({
      next: (res) => {
        this.stats = res.data;
      }
    });
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
    this.inventoryService.getProducts(this.currentPage, this.pageSize, search).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.inventoryItems = res.data.items || [];
          this.totalItems = res.data.totalCount || 0;

          this.productOptions = this.inventoryItems.map(p => ({ label: p.name, value: p.id }));
        }
        this.loading = false;
      },
      error: () => {
        this.notificationService.error('Failed to load products');
        this.loading = false;
      }
    });
  }

  loadEquipment() {
    this.inventoryService.getEquipment().subscribe({
      next: (res) => {
        const equipment = res.data || [];
        this.allEquipmentItems = [...equipment];
        this.equipmentItems = [...this.allEquipmentItems];

        this.maintenanceItems = this.allEquipmentItems.filter(item =>
          item.health < 80 || item.status === 'Maintenance' || item.status === 'Needs Repair'
        );
      }
    });
  }

  loadSalesHistory() {
    this.inventoryService.getSalesHistory().subscribe({
      next: (res) => { this.salesItems = res.data || []; }
    });
  }

  loadServiceHistory() {
    this.inventoryService.getMaintenanceHistoryGlobal().subscribe({
      next: (res) => { this.serviceHistoryItems = res.data || []; }
    });
  }

  filterInventory() {
    this.currentPage = 1;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadProducts();
  }

  private initForms() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      sku: ['', [Validators.required]],
      category: ['Supplements', [Validators.required]],
      buyingPrice: [0, [Validators.required, Validators.min(0)]],
      sellingPrice: [0, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      reorderLevel: [5],
      imageUrl: [''],
      description: ['']
    });

    this.equipmentForm = this.fb.group({
      name: ['', Validators.required],
      serialNumber: ['', Validators.required],
      category: ['', Validators.required],
      purchaseDate: ['', Validators.required],
      warrantyExpiry: ['', Validators.required],
      condition: ['New', Validators.required],
      maintenanceInterval: [6, Validators.required],
      initialHealth: [100],
      imageUrl: ['']
    });

    this.maintenanceForm = this.fb.group({
      id: [null],
      equipmentId: ['', Validators.required],
      serviceType: ['Routine', Validators.required],
      description: ['', Validators.required],
      technicianName: ['', Validators.required],
      startDate: [new Date().toISOString().split('T')[0], Validators.required],
      estimatedEndDate: [''],
      completedDate: [''],
      cost: [0, [Validators.required, Validators.min(0)]],
      status: ['In Progress', Validators.required],
      notes: ['']
    });

    this.maintenanceForm.get('status')?.valueChanges.subscribe(status => {
      if (status === 'Completed') {
        this.maintenanceForm.patchValue({
          completedDate: new Date().toISOString().split('T')[0]
        });
      }
    });

    this.saleForm = this.fb.group({
      memberId: ['', [Validators.required]],
      productId: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      paymentMethod: ['Card'],
      date: [new Date().toISOString().split('T')[0]]
    });

    this.saleForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(val => {
      this.calculateSaleSummary(val);
    });
  }

  private calculateSaleSummary(val: any) {
    if (!val.productId) {
      this.selectedSaleProduct = null;
      this.saleTotal = 0;
      return;
    }
    this.selectedSaleProduct = this.allInventoryItems.find(p => p.id === val.productId);
    if (this.selectedSaleProduct) {
      this.saleTotal = this.selectedSaleProduct.sellingPrice * (val.quantity || 1);

      const quantityControl = this.saleForm.get('quantity');
      if (quantityControl) {
        if (val.quantity > this.selectedSaleProduct.stockQuantity) {
          quantityControl.setErrors({ ...quantityControl.errors, insufficientStock: true, max: this.selectedSaleProduct.stockQuantity });
        } else if (val.quantity <= 0) {
          quantityControl.setErrors({ ...quantityControl.errors, min: 1 });
        } else {
          const errors = { ...quantityControl.errors };
          delete errors['insufficientStock'];
          quantityControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }
      }
    }
  }

  generateSKU() {
    const random = Math.floor(1000 + Math.random() * 9000);
    const prefix = this.productForm.get('category')?.value?.substring(0, 3).toUpperCase() || 'PROD';
    this.productForm.patchValue({ sku: `${prefix}-${random}` });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  private uploadAndSave(type: 'product' | 'equipment') {
    if (this.selectedFile) {
      this.loading = true;
      const folder = type === 'product' ? 'products' : 'equipment';
      this.fileUploadService.uploadFile(this.selectedFile, folder).subscribe({
        next: (res) => {
          if (type === 'product') {
            this.productForm.patchValue({ imageUrl: res.data.url });
            this.commitProduct();
          } else {
            this.equipmentForm.patchValue({ imageUrl: res.data.url });
            this.commitEquipment();
          }
        },
        error: () => {
          this.notificationService.error('Failed to upload image');
          this.loading = false;
        }
      });
    } else {
      type === 'product' ? this.commitProduct() : this.commitEquipment();
    }
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'list' ? 'dashboard' : 'list';
  }

  setTab(tab: 'inventory' | 'equipment' | 'maintenance' | 'sales') {
    this.activeTab = tab;
    if (tab === 'maintenance') {
      this.loadServiceHistory();
    }
  }

  onInventoryAction(event: { action: string, row: any }) {
    if (event.action === 'edit' || event.action === 'service') {
      if (this.activeTab === 'inventory') {
        this.openProductDrawer(event.row);
      } else if (this.activeTab === 'equipment') {
        if (event.action === 'service') this.openMaintenanceDrawer(event.row);
        else this.openEquipmentDrawer(event.row);
      } else if (this.activeTab === 'maintenance') {
        if (event.row.status === 'Completed') {
          this.notificationService.info('Completed logs cannot be edited for audit integrity.');
          return;
        }
        this.openMaintenanceDrawer(event.row);
      }
    } else if (event.action === 'view' || event.action === 'row-click') {
      if (this.activeTab === 'inventory') this.openProductView(event.row);
      else if (this.activeTab === 'equipment') this.openEquipmentView(event.row);
      else if (this.activeTab === 'maintenance') this.openMaintenanceView(event.row);
      else if (this.activeTab === 'sales') this.openSaleView(event.row);
    } else if (event.action === 'delete') {
      if (this.activeTab === 'inventory') this.deleteProduct(event.row.id);
    } else if (event.action === 'sell') {
      this.openSaleDrawer(event.row);
    }
  }

  getBadgeClass(status: string): any {
    const s = status?.toLowerCase();
    if (['in stock', 'excellent', 'success', 'active'].includes(s)) return 'badge-success';
    if (['low stock', 'maintenance due', 'pending', 'fair', 'in maintenance'].includes(s)) return 'badge-warning';
    if (['out of stock', 'critical', 'expired', 'repair needed', 'danger'].includes(s)) return 'badge-danger';
    return 'badge-secondary';
  }

  openProductView(product: any) {
    this.selectedProduct = product;
    this.isProductViewOpen = true;
  }

  openEquipmentView(equipment: any) {
    this.selectedEquipment = equipment;
    this.isEquipmentViewOpen = true;
  }

  openSaleView(sale: any) {
    this.selectedSale = sale;
    this.isSaleViewOpen = true;
  }

  printReceipt() {
    if (!this.selectedSale) return;
    this.notificationService.success('Sending receipt to printer...');
    window.print();
  }

  emailReceipt() {
    if (!this.selectedSale) return;
    this.loading = true;
    this.inventoryService.sendReceiptEmail(this.selectedSale.id).subscribe({
      next: () => {
        this.notificationService.success(`Receipt emailed to ${this.selectedSale.memberName}`);
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to email receipt');
        this.loading = false;
      }
    });
  }

  editFromView() {
    if (this.selectedProduct) {
      const p = this.selectedProduct;
      this.closeDrawers();
      setTimeout(() => this.openProductDrawer(p), 150);
    } else if (this.selectedEquipment) {
      const e = this.selectedEquipment;
      this.closeDrawers();
      setTimeout(() => this.openEquipmentDrawer(e), 150);
    }
  }

  openProductDrawer(product?: any) {
    this.resetFileUpload();
    this.isProductDrawerOpen = true;
    if (product) {
      this.isEditingProduct = true;
      this.selectedProductId = product.id;
      this.productForm.patchValue(product);
      this.imagePreview = product.imageUrl;
    } else {
      this.isEditingProduct = false;
      this.productForm.reset({
        category: 'Supplements',
        buyingPrice: 0,
        sellingPrice: 0,
        stockQuantity: 0,
        reorderLevel: 5
      });
    }
  }

  openEquipmentDrawer(equipment?: any) {
    this.resetFileUpload();
    this.isEquipmentDrawerOpen = true;
    if (equipment) {
      this.isEditingEquipment = true;
      this.selectedEquipmentId = equipment.id;
      this.equipmentForm.patchValue({
        name: equipment.name,
        serialNumber: equipment.serialNumber,
        category: equipment.category,
        purchaseDate: equipment.purchaseDate?.split('T')[0],
        warrantyExpiry: equipment.warrantyExpiry?.split('T')[0],
        condition: equipment.condition,
        maintenanceInterval: equipment.maintenanceIntervalMonths || 6,
        initialHealth: equipment.health || 100,
        imageUrl: equipment.imageUrl
      });
      this.imagePreview = equipment.imageUrl;
    } else {
      this.isEditingEquipment = false;
      this.selectedEquipmentId = null;
      this.equipmentForm.reset({
        condition: 'New',
        maintenanceInterval: 6,
        initialHealth: 100
      });
    }
  }

  openSaleDrawer(product?: any) {
    this.saleForm.reset({
      paymentMethod: 'Card',
      quantity: 1,
      date: new Date().toISOString().split('T')[0]
    });

    if (product) {
      this.saleForm.patchValue({ productId: product.id });
    }

    this.isSaleDrawerOpen = true;
  }

  closeDrawers() {
    this.isProductDrawerOpen = false;
    this.isProductViewOpen = false;
    this.isEquipmentDrawerOpen = false;
    this.isEquipmentViewOpen = false;
    this.isEditingEquipment = false;
    this.isMaintenanceDrawerOpen = false;
    this.isSaleDrawerOpen = false;
    this.selectedProduct = null;
    this.selectedEquipment = null;
    this.resetFileUpload();
  }

  private resetFileUpload() {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  saveProduct() {
    if (this.productForm.invalid) return;
    this.uploadAndSave('product');
  }

  private commitProduct() {
    const action = this.isEditingProduct && this.selectedProductId
      ? this.inventoryService.updateProduct(this.selectedProductId, this.productForm.value)
      : this.inventoryService.addProduct(this.productForm.value);

    action.subscribe({
      next: () => {
        this.notificationService.success(`Product ${this.isEditingProduct ? 'updated' : 'added'} successfully`);
        this.loadProducts();
        this.closeDrawers();
        this.loading = false;
      },
      error: () => {
        this.notificationService.error('Operation failed');
        this.loading = false;
      }
    });
  }

  saveEquipment() {
    if (this.equipmentForm.invalid) return;
    this.uploadAndSave('equipment');
  }

  private commitEquipment() {
    const action = this.isEditingEquipment && this.selectedEquipmentId
      ? this.inventoryService.updateEquipment(this.selectedEquipmentId, this.equipmentForm.value)
      : this.inventoryService.addEquipment(this.equipmentForm.value);

    action.subscribe({
      next: () => {
        this.notificationService.success(`Equipment ${this.isEditingEquipment ? 'updated' : 'registered'} successfully`);
        this.loadEquipment();
        this.closeDrawers();
        this.loading = false;
      },
      error: () => {
        this.notificationService.error('Failed to save equipment');
        this.loading = false;
      }
    });
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure?')) {
      this.inventoryService.deleteProduct(id).subscribe({
        next: () => { this.notificationService.success('Deleted'); this.loadProducts(); }
      });
    }
  }

  saveSale() {
    if (this.saleForm.invalid) return;
    this.inventoryService.recordSale(this.saleForm.value).subscribe({
      next: () => { this.notificationService.success('Recorded'); this.loadProducts(); this.loadSalesHistory(); this.closeDrawers(); },
      error: (err) => this.notificationService.error(err.error?.message || 'Error')
    });
  }
  openMaintenanceDrawer(equipmentOrLog: any) {
    this.maintenanceForm.reset({
      startDate: new Date().toISOString().split('T')[0],
      status: 'In Progress',
      cost: 0
    });

    if (this.activeTab === 'maintenance') {
      this.maintenanceForm.patchValue({
        ...equipmentOrLog,
        startDate: equipmentOrLog.startDate?.split('T')[0],
        estimatedEndDate: equipmentOrLog.estimatedEndDate?.split('T')[0],
        completedDate: equipmentOrLog.completedDate?.split('T')[0],
      });
      this.isMaintenanceDrawerOpen = true;
    } else {
      this.selectedEquipment = equipmentOrLog;
      this.maintenanceForm.patchValue({ equipmentId: equipmentOrLog.id });
      this.isMaintenanceDrawerOpen = true;

      this.inventoryService.getMaintenanceHistory(equipmentOrLog.id).subscribe({
        next: (res) => {
          this.maintenanceHistory = res.data || [];
          if (equipmentOrLog.isInMaintenance) {
            const activeLog = this.maintenanceHistory.find(h => h.status !== 'Completed');
            if (activeLog) {
              this.maintenanceForm.patchValue({
                id: activeLog.id,
                serviceType: activeLog.serviceType,
                startDate: activeLog.startDate?.split('T')[0],
                status: activeLog.status,
                cost: activeLog.cost,
                technicianName: activeLog.technicianName,
                description: activeLog.description,
                notes: activeLog.notes,
                estimatedEndDate: activeLog.estimatedEndDate?.split('T')[0]
              });
            }
          }
        }
      });
    }
  }

  saveMaintenance() {
    if (this.maintenanceForm.invalid) return;
    this.loading = true;
    const formValue = this.maintenanceForm.value;
    const id = formValue.id;

    const action = id
      ? this.inventoryService.updateMaintenance(id, formValue)
      : this.inventoryService.logMaintenance(formValue);

    action.subscribe({
      next: () => {
        this.notificationService.success(`Maintenance log ${id ? 'updated' : 'recorded'} successfully`);
        this.loadEquipment();
        this.loadServiceHistory();
        this.isMaintenanceDrawerOpen = false;
        this.loading = false;
      },
      error: () => {
        this.notificationService.error(`Failed to ${id ? 'update' : 'record'} maintenance log`);
        this.loading = false;
      }
    });
  }

  markAsServiced(eq: any) {
    if (!eq) return;
    this.openMaintenanceDrawer(eq);
  }

  openMaintenanceView(log: any) {
    this.selectedMaintenanceLog = log;
    this.isMaintenanceViewOpen = true;
  }
}

