import { Component, OnInit, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
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
  selector: 'app-maintenance-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlideDrawerComponent, DropdownComponent, DateTimePickerComponent],
  templateUrl: './maintenance-drawer.component.html',
  styleUrls: ['./maintenance-drawer.component.scss']
})
export class MaintenanceDrawerComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private inventoryService = inject(InventoryService);
  private notificationService = inject(NotificationService);

  @Input() isOpen = false;
  @Input() equipment: any = null;
  @Input() log: any = null;
  @Input() serviceTypeOptions: DropdownOption[] = [];
  @Input() statusOptions: DropdownOption[] = [];
  @Input() activeTab: 'inventory' | 'equipment' | 'maintenance' | 'sales' = 'inventory';

  @Output() closeDrawer = new EventEmitter<void>();
  @Output() maintenanceSaved = new EventEmitter<void>();

  maintenanceForm!: FormGroup;
  maintenanceHistory: any[] = [];
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
    this.maintenanceForm = this.fb.group({
      id: [null],
      equipmentId: ['', Validators.required],
      serviceType: ['Routine', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(300)]],
      technicianName: ['', [Validators.required, Validators.maxLength(30)]],
      startDate: [new Date().toISOString().split('T')[0], [Validators.required, noFutureDateValidator]],
      estimatedEndDate: [''],
      completedDate: [''],
      cost: [0, [Validators.required, Validators.min(0), Validators.max(1000000)]],
      status: ['In Progress', Validators.required],
      notes: ['']
    });

    this.maintenanceForm.get('status')?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(status => {
      if (status === 'Completed') {
        this.maintenanceForm.patchValue({
          completedDate: new Date().toISOString().split('T')[0]
        });
      }
    });

    this.resetForm();
  }

  private resetForm() {
    if (!this.maintenanceForm) return;

    this.maintenanceForm.reset({
      startDate: new Date().toISOString().split('T')[0],
      status: 'In Progress',
      cost: 0
    });

    this.maintenanceHistory = [];

    if (this.activeTab === 'maintenance' && this.log) {
      this.maintenanceForm.patchValue({
        ...this.log,
        startDate: this.log.startDate?.split('T')[0],
        estimatedEndDate: this.log.estimatedEndDate?.split('T')[0],
        completedDate: this.log.completedDate?.split('T')[0],
      });
    } else if (this.equipment) {
      this.maintenanceForm.patchValue({ equipmentId: this.equipment.id });
      this.loadEquipmentHistory(this.equipment.id);
    }
  }

  private loadEquipmentHistory(equipmentId: string) {
    this.inventoryService.getMaintenanceHistory(equipmentId).subscribe({
      next: (res) => {
        this.maintenanceHistory = res.data || [];
        if (this.equipment?.isInMaintenance) {
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

  saveMaintenance() {
    if (this.maintenanceForm.invalid) {
      this.maintenanceForm.markAllAsTouched();
      return;
    }
    this.loading = true;

    const formValue = this.maintenanceForm.value;
    const id = formValue.id;

    const action = id
      ? this.inventoryService.updateMaintenance(id, formValue)
      : this.inventoryService.logMaintenance(formValue);

    action.subscribe({
      next: () => {
        this.notificationService.success(CONSTANTS.INVENTORY_MODULE.MAINTENANCE_SAVE_SUCCESS.replace('{status}', id ? 'updated' : 'recorded'));
        this.maintenanceSaved.emit();
        this.closeDrawer.emit();
        this.loading = false;
      },
      error: () => {
        this.notificationService.error(CONSTANTS.INVENTORY_MODULE.MAINTENANCE_SAVE_ERROR.replace('{status}', id ? 'update' : 'record'));
        this.loading = false;
      }
    });
  }

  clampValue(controlName: string, max: number) {
    const val = this.maintenanceForm.get(controlName)?.value;
    if (val > max) {
      this.maintenanceForm.get(controlName)?.setValue(max);
    }
  }
}
