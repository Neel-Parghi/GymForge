import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../../../../core/services/notification.service';
import { GymListResponse } from '../../../../../shared/models/gym.model';
import { SlideDrawerComponent } from "../../../../../shared/components/slide-drawer/slide-drawer";
import { ValidationMessage } from "../../../../../shared/components/validation-message/validation-message";
import { AddBranchModalComponent } from '../add-branch-modal/add-branch-modal.component';
import { GymService } from '../../../../../core/services/gym.service';

@Component({
  selector: 'app-gym-details-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SlideDrawerComponent, ValidationMessage, AddBranchModalComponent],
  templateUrl: './gym-details-drawer.component.html',
  styleUrl: './gym-details-drawer.component.scss'
})
export class GymDetailsDrawerComponent implements OnChanges {
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private gymService = inject(GymService);

  @Input() isOpen = false;
  @Input() isEditing = false;
  @Input() set gym(value: GymListResponse | undefined) {
    this._gym = value;
    if (value) {
      this.initForm(value);
    }
  }

  get gym() { return this._gym; }
  private _gym?: GymListResponse;

  @Output() closeDrawer = new EventEmitter<void>();
  @Output() gymUpdated = new EventEmitter<any>();

  activeTab: 'overview' | 'branches' = 'overview';
  branches: any[] = [];
  isLoadingBranches = false;
  isAddBranchModalOpen = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isEditing'] || changes['gym']) {
      if (this.isEditing) {
        this.editForm.enable();
      } else {
        this.editForm.disable();
      }
    }
    if (changes['isOpen'] && this.isOpen) {
      this.activeTab = 'overview';
      if (this.gym?.id) {
        this.loadBranches();
      }
    }
  }

  editForm = this.fb.group({
    id: [''],
    gymName: ['', [Validators.required]],
    brandName: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    websiteUrl: [''],
    description: [''],
    gstNumber: [''],
    registrationNumber: [''],
    isActive: [true],
    isVerified: [false]
  });

  initForm(gym: GymListResponse) {
    this.editForm.patchValue({
      id: gym.id,
      gymName: gym.gymName,
      brandName: gym.brandName,
      email: gym.email,
      phone: gym.phone,
      websiteUrl: gym.websiteUrl,
      description: gym.description,
      gstNumber: gym.gstNumber,
      registrationNumber: gym.registrationNumber,
      isActive: gym.isActive,
      isVerified: gym.isVerified
    });
  }

  toggleEdit() {
    this.isEditing = true;
    this.editForm.enable();
  }

  cancelEdit() {
    this.isEditing = false;
    if (this._gym) {
      this.initForm(this._gym);
    }
    this.editForm.disable();
  }

  onClose() {
    this.cancelEdit();
    this.closeDrawer.emit();
  }

  save() {
    if (this.editForm.valid && this._gym?.id) {
      this.gymUpdated.emit(this.editForm.getRawValue());
      this.isEditing = false;
      this.editForm.disable();
      this.onClose();
    }
  }

  loadBranches() {
    if (!this.gym?.id) return;
    this.isLoadingBranches = true;
    this.gymService.getGymBranches(this.gym.id).subscribe({
      next: (res) => {
        this.branches = res.Data || [];
        this.isLoadingBranches = false;
      },
      error: () => this.isLoadingBranches = false
    });
  }

  switchTab(tab: 'overview' | 'branches') {
    this.activeTab = tab;
    if (tab === 'branches') {
      this.loadBranches();
    }
  }
}
