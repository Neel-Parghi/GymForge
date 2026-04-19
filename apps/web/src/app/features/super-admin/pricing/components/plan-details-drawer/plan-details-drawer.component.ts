import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SlideDrawerComponent } from "../../../../../shared/components/slide-drawer/slide-drawer";
import { ValidationMessage } from '../../../../../shared/components/validation-message/validation-message';
import { PricingPlan, PricingPlanCreateRequest } from '../../../../../shared/models/pricing.model';

@Component({
  selector: 'app-plan-details-drawer',
  standalone: true,
  imports: [CommonModule, SlideDrawerComponent, ReactiveFormsModule, ValidationMessage],
  templateUrl: './plan-details-drawer.component.html',
  styleUrl: './plan-details-drawer.component.scss'
})
export class PlanDetailsDrawerComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isEditing = false;
  @Input() planContext: PricingPlan | null = null;

  @Output() closeDrawer = new EventEmitter<void>();
  @Output() savePlan = new EventEmitter<PricingPlan>();
  @Output() isEditingChange = new EventEmitter<boolean>();

  editForm!: FormGroup;
  private fb = inject(FormBuilder);

  constructor() {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      durationInDays: [null, [Validators.required, Validators.min(1)]],
      maxBranches: [null],
      maxMembers: [null],
      isTrial: [false],
      isActive: [true]
    });
    this.editForm.disable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['planContext'] && this.planContext) {
      this.editForm.patchValue({
        name: this.planContext.name,
        description: this.planContext.description || '',
        price: this.planContext.price,
        durationInDays: this.planContext.durationInDays,
        maxBranches: this.planContext.maxBranches || null,
        maxMembers: this.planContext.maxMembers || null,
        isTrial: this.planContext.isTrial,
        isActive: this.planContext.isActive
      });
    }

    if (changes['isEditing'] || changes['planContext']) {
      if (this.isEditing) {
        this.editForm.enable();
      } else {
        this.editForm.disable();
      }
    }
  }

  toggleEdit() {
    this.isEditing = true;
    this.isEditingChange.emit(true);
    this.editForm.enable();
  }

  cancelEdit() {
    this.isEditing = false;
    this.isEditingChange.emit(false);
    if (this.planContext) {
      this.editForm.patchValue({
        name: this.planContext.name,
        description: this.planContext.description || '',
        price: this.planContext.price,
        durationInDays: this.planContext.durationInDays,
        maxBranches: this.planContext.maxBranches || null,
        maxMembers: this.planContext.maxMembers || null,
        isTrial: this.planContext.isTrial,
        isActive: this.planContext.isActive
      });
    }
    this.editForm.disable();
  }

  save() {
    if (this.editForm.valid && this.isEditing && this.planContext) {
      const updatedPlan: PricingPlan = {
        ...this.planContext,
        ...this.editForm.value
      };
      this.savePlan.emit(updatedPlan);
      this.isEditing = false;
      this.isEditingChange.emit(false);
      this.editForm.disable();
    } else {
      this.editForm.markAllAsTouched();
    }
  }

  onClose() {
    this.cancelEdit();
    this.closeDrawer.emit();
  }
}
