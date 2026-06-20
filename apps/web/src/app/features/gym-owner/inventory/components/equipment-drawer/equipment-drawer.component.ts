import { Component, OnInit, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { SlideDrawerComponent } from '../../../../../shared/components/slide-drawer/slide-drawer.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { DateTimePickerComponent } from '../../../../../shared/components/date-time-picker/date-time-picker.component';
import { DropdownOption } from '../../../../../shared/models/dropdown.model';
import { InventoryService } from '../../../../../core/services/inventory.service';
import { FileUploadService } from '../../../../../core/services/file-upload.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { CONSTANTS } from '../../../../../core/constants/constants';
import { noFutureDateValidator } from '../../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-equipment-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlideDrawerComponent, DropdownComponent, DateTimePickerComponent],
  templateUrl: './equipment-drawer.component.html',
  styleUrls: ['./equipment-drawer.component.scss']
})
export class EquipmentDrawerComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private inventoryService = inject(InventoryService);
  private fileUploadService = inject(FileUploadService);
  private notificationService = inject(NotificationService);

  @Input() isOpen = false;
  @Input() equipment: any = null;
  @Input() categories: DropdownOption[] = [];
  @Input() conditionOptions: DropdownOption[] = [];

  @Output() closeDrawer = new EventEmitter<void>();
  @Output() equipmentSaved = new EventEmitter<void>();

  equipmentForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  loading = false;
  isEditingEquipment = false;
  today = new Date();

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['equipment']) {
      this.updateFormState();
    }
  }

  private initForm() {
    this.equipmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      serialNumber: ['', [Validators.required, Validators.maxLength(20)]],
      category: ['', Validators.required],
      purchaseDate: ['', [Validators.required, noFutureDateValidator]],
      warrantyExpiry: ['', Validators.required],
      condition: ['New', Validators.required],
      maintenanceInterval: [6, [Validators.required, Validators.min(1), Validators.max(12)]],
      initialHealth: [100],
      imageUrl: ['']
    });
    this.updateFormState();
  }

  private updateFormState() {
    if (!this.equipmentForm) return;

    if (this.equipment) {
      this.isEditingEquipment = true;
      this.equipmentForm.patchValue({
        name: this.equipment.name,
        serialNumber: this.equipment.serialNumber,
        category: this.equipment.category,
        purchaseDate: this.equipment.purchaseDate?.split('T')[0],
        warrantyExpiry: this.equipment.warrantyExpiry?.split('T')[0],
        condition: this.equipment.condition,
        maintenanceInterval: this.equipment.maintenanceIntervalMonths || 6,
        initialHealth: this.equipment.health || 100,
        imageUrl: this.equipment.imageUrl
      });
      this.imagePreview = this.equipment.imageUrl;
    } else {
      this.isEditingEquipment = false;
      this.selectedFile = null;
      this.imagePreview = null;
      this.equipmentForm.reset({
        condition: 'New',
        maintenanceInterval: 6,
        initialHealth: 100
      });
    }
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

  saveEquipment() {
    if (this.equipmentForm.invalid) {
      this.equipmentForm.markAllAsTouched();
      return;
    }

    if (this.selectedFile) {
      this.loading = true;
      this.fileUploadService.uploadFile(this.selectedFile, 'equipment').subscribe({
        next: (res) => {
          this.equipmentForm.patchValue({ imageUrl: res.data.url });
          this.commitEquipment();
        },
        error: () => {
          this.notificationService.error(CONSTANTS.INVENTORY_MODULE.UPLOAD_IMAGE_ERROR);
          this.loading = false;
        }
      });
    } else {
      this.commitEquipment();
    }
  }

  private commitEquipment() {
    this.loading = true;
    const action = this.isEditingEquipment && this.equipment?.id
      ? this.inventoryService.updateEquipment(this.equipment.id, this.equipmentForm.value)
      : this.inventoryService.addEquipment(this.equipmentForm.value);

    action.subscribe({
      next: () => {
        this.notificationService.success(CONSTANTS.INVENTORY_MODULE.EQUIPMENT_SAVE_SUCCESS.replace('{status}', this.isEditingEquipment ? 'updated' : 'registered'));
        this.equipmentSaved.emit();
        this.closeDrawer.emit();
        this.loading = false;
      },
      error: () => {
        this.notificationService.error(CONSTANTS.INVENTORY_MODULE.EQUIPMENT_SAVE_ERROR);
        this.loading = false;
      }
    });
  }

  clampValue(controlName: string, max: number) {
    const val = this.equipmentForm.get(controlName)?.value;
    if (val > max) {
      this.equipmentForm.get(controlName)?.setValue(max);
    }
  }
}
