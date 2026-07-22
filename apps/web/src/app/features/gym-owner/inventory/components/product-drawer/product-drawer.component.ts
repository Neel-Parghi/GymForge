import { Component, EventEmitter, Input, OnInit, Output, inject, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SlideDrawerComponent } from '../../../../../shared/components/slide-drawer/slide-drawer.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../../../shared/models/dropdown.model';
import { InventoryService } from '../../../../../core/services/inventory.service';
import { FileUploadService } from '../../../../../core/services/file-upload.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { CONSTANTS } from '../../../../../core/constants/constants';

@Component({
  selector: 'app-product-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlideDrawerComponent, DropdownComponent],
  templateUrl: './product-drawer.component.html',
  styleUrls: ['./product-drawer.component.scss']
})
export class ProductDrawerComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private inventoryService = inject(InventoryService);
  private fileUploadService = inject(FileUploadService);
  private notificationService = inject(NotificationService);

  @Input() isOpen = false;
  @Input() product: any = null;
  @Input() categories: DropdownOption[] = [];

  @Output() closeDrawer = new EventEmitter<void>();
  @Output() productSaved = new EventEmitter<void>();

  productForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  loading = false;
  isEditingProduct = false;

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.updateFormState();
    }
  }

  private initForm() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      sku: ['', [Validators.required, Validators.maxLength(25)]],
      category: ['Supplements', [Validators.required]],
      buyingPrice: [0, [Validators.required, Validators.min(1), Validators.max(100000)]],
      sellingPrice: [0, [Validators.required, Validators.min(1), Validators.max(100000)]],
      stockQuantity: [0, [Validators.required, Validators.min(0), Validators.max(1000)]],
      reorderLevel: [5, [Validators.min(0)]],
      imageUrl: [''],
      description: ['', [Validators.maxLength(300)]]
    });
    this.updateFormState();
  }

  private updateFormState() {
    if (!this.productForm) return;

    if (this.product) {
      this.isEditingProduct = true;
      this.productForm.patchValue(this.product);
      this.imagePreview = this.product.imageUrl;
    } else {
      this.isEditingProduct = false;
      this.selectedFile = null;
      this.imagePreview = null;
      this.productForm.reset({
        category: 'Supplements',
        buyingPrice: 0,
        sellingPrice: 0,
        stockQuantity: 0,
        reorderLevel: 5
      });
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

  saveProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    if (this.selectedFile) {
      this.loading = true;
      this.fileUploadService.uploadFile(this.selectedFile, 'products').subscribe({
        next: (res) => {
          this.productForm.patchValue({ imageUrl: res.data.url });
          this.commitProduct();
        },
        error: () => {
          this.notificationService.error(CONSTANTS.INVENTORY_MODULE.UPLOAD_IMAGE_ERROR);
          this.loading = false;
        }
      });
    } else {
      this.commitProduct();
    }
  }

  private commitProduct() {
    this.loading = true;
    const action = (this.isEditingProduct && this.product?.id
      ? this.inventoryService.updateProduct(this.product.id, this.productForm.value)
      : this.inventoryService.addProduct(this.productForm.value)) as Observable<any>;

    action.subscribe({
      next: () => {
        this.notificationService.success(CONSTANTS.INVENTORY_MODULE.PRODUCT_SAVE_SUCCESS.replace('{status}', this.isEditingProduct ? 'updated' : 'added'));
        this.productSaved.emit();
        this.closeDrawer.emit();
        this.loading = false;
      },
      error: () => {
        this.notificationService.error(CONSTANTS.INVENTORY_MODULE.PRODUCT_SAVE_ERROR);
        this.loading = false;
      }
    });
  }

  clampValue(controlName: string, max: number) {
    const val = this.productForm.get(controlName)?.value;
    if (val > max) {
      this.productForm.get(controlName)?.setValue(max);
    }
  }

  clampReorderLevel() {
    const stock = this.productForm.get('stockQuantity')?.value || 0;
    const maxVal = Math.max(0, stock - 1);
    const val = this.productForm.get('reorderLevel')?.value;
    if (val > maxVal) {
      this.productForm.get('reorderLevel')?.setValue(maxVal);
    }
  }
}
