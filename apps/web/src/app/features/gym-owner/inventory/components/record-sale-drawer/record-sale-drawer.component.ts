import { Component, OnInit, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SlideDrawerComponent } from '../../../../../shared/components/slide-drawer/slide-drawer.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { DateTimePickerComponent } from '../../../../../shared/components/date-time-picker/date-time-picker.component';
import { DropdownOption } from '../../../../../shared/models/dropdown.model';
import { InventoryService } from '../../../../../core/services/inventory.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { CONSTANTS } from '../../../../../core/constants/constants';
import { noFutureDateValidator } from '../../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-record-sale-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlideDrawerComponent, DropdownComponent, DateTimePickerComponent],
  templateUrl: './record-sale-drawer.component.html',
  styleUrls: ['./record-sale-drawer.component.scss']
})
export class RecordSaleDrawerComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private inventoryService = inject(InventoryService);
  private notificationService = inject(NotificationService);

  @Input() isOpen = false;
  @Input() product: any = null;
  @Input() memberOptions: DropdownOption[] = [];
  @Input() productOptions: DropdownOption[] = [];
  @Input() allProducts: any[] = [];

  @Output() closeDrawer = new EventEmitter<void>();
  @Output() saleRecorded = new EventEmitter<void>();

  saleForm!: FormGroup;
  selectedSaleProduct: any = null;
  saleTotal: number = 0;
  loading = false;
  today = new Date();

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.resetForm();
    }
  }

  private initForm() {
    this.saleForm = this.fb.group({
      memberId: ['', [Validators.required]],
      productId: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      paymentMethod: ['Card'],
      date: [new Date().toISOString().split('T')[0], [Validators.required, noFutureDateValidator]]
    });

    this.saleForm.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(val => {
      this.calculateSaleSummary(val);
    });

    this.resetForm();
  }

  private resetForm() {
    if (!this.saleForm) return;

    this.saleForm.reset({
      paymentMethod: 'Card',
      quantity: 1,
      date: new Date().toISOString().split('T')[0]
    });

    if (this.product) {
      this.saleForm.patchValue({ productId: this.product.id });
    }
  }

  private calculateSaleSummary(val: any) {
    if (!val.productId) {
      this.selectedSaleProduct = null;
      this.saleTotal = 0;
      return;
    }

    this.selectedSaleProduct = this.allProducts.find(p => p.id === val.productId);
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

  saveSale() {
    if (this.saleForm.invalid) {
      this.saleForm.markAllAsTouched();
      return;
    }
    this.loading = true;

    this.inventoryService.recordSale(this.saleForm.value).subscribe({
      next: () => {
        this.notificationService.success(CONSTANTS.INVENTORY_MODULE.SALE_RECORD_SUCCESS);
        this.saleRecorded.emit();
        this.closeDrawer.emit();
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Failed to record sale');
        this.loading = false;
      }
    });
  }

  clampQuantity() {
    if (this.selectedSaleProduct) {
      const stock = this.selectedSaleProduct.stockQuantity || 0;
      const val = this.saleForm.get('quantity')?.value;
      if (val > stock) {
        this.saleForm.get('quantity')?.setValue(stock);
      }
    }
  }
}
