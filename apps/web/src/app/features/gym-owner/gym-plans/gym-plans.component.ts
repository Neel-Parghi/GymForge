import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GymPlanService } from '../../../core/services/gym-plan.service';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { GymPlan, CreateGymPlanRequest, UpdateGymPlanRequest } from '../../../shared/models/gym-plan.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-gym-plans',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gym-plans.component.html',
  styleUrl: './gym-plans.component.scss'
})
export class GymPlansComponent implements OnInit {
  private gymPlanService = inject(GymPlanService);
  private authService = inject(AuthApiService);
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  plans: GymPlan[] = [];
  loading = false;
  showModal = false;
  isEditing = false;
  planForm!: FormGroup;
  currentPlanId?: string;
  ownerId: string = '';

  // Carousel properties
  currentIndex = 1;
  isResetting = false;
  displayPlans: GymPlan[] = [];
  featuredPlanId: string = '';

  featuresList: string[] = [];
  newFeature: string = '';

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.authService.userProfile$.subscribe(p => {
      if (p) {
        this.ownerId = p.id;
        this.loadPlans();
      }
    });

    this.profileService.getProfile().subscribe();
  }

  private initForm(): void {
    this.planForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      durationMonths: [1, [Validators.required, Validators.min(1)]],
      maxBranches: [null, [Validators.min(1)]],
      isActive: [true],
      isOffer: [false],
      discountedPrice: [null, [Validators.min(0)]],
      extendedMonths: [null, [Validators.min(0)]]
    });
  }

  loadPlans(): void {
    if (!this.ownerId) {
      return;
    }

    this.loading = true;
    this.gymPlanService.getPlansByOwnerId(this.ownerId).subscribe({
      next: (res) => {
        const plans = (res as any).Data || (res as any).data || (Array.isArray(res) ? res : []);
        this.plans = plans;
        this.setupCarousel();
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.error('Failed to load plans');
        this.loading = false;
      }
    });
  }

  setupCarousel(): void {
    if (this.plans.length === 0) return;

    this.featuredPlanId = this.plans[0].id;

    const last = this.plans[this.plans.length - 1];
    const secondLast = this.plans.length > 1 ? this.plans[this.plans.length - 2] : last;
    const first = this.plans[0];
    const second = this.plans.length > 1 ? this.plans[1] : first;

    this.displayPlans = [secondLast, last, ...this.plans, first, second];
    this.currentIndex = 2;
  }

  nextSlide(): void {
    if (this.isResetting) return;
    this.currentIndex++;
    this.updateFeatured();

    if (this.currentIndex >= this.plans.length + 2) {
      setTimeout(() => {
        this.isResetting = true;
        this.currentIndex = 2;
        setTimeout(() => this.isResetting = false, 50);
      }, 500);
    }
  }

  prevSlide(): void {
    if (this.isResetting) return;
    this.currentIndex--;
    this.updateFeatured();

    if (this.currentIndex <= 1) {
      setTimeout(() => {
        this.isResetting = true;
        this.currentIndex = this.plans.length + 1;
        setTimeout(() => this.isResetting = false, 50);
      }, 500);
    }
  }

  updateFeatured(): void {
    let index = this.currentIndex - 2;
    if (index < 0) index = this.plans.length - 1;
    if (index >= this.plans.length) index = 0;
    this.featuredPlanId = this.plans[index].id;
  }

  getCarouselTransform(): string {
    const cardWidth = 320 + 24;
    return `translateX(-${(this.currentIndex - 1) * cardWidth}px)`;
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentPlanId = undefined;
    this.featuresList = [];
    this.newFeature = '';
    this.planForm.reset({
      price: 0,
      durationMonths: 1,
      isActive: true,
      isOffer: false
    });
    this.showModal = true;
  }

  openEditModal(plan: GymPlan): void {
    this.isEditing = true;
    this.currentPlanId = plan.id;
    this.featuresList = [...(plan.features || [])];
    this.newFeature = '';
    this.planForm.patchValue({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      durationMonths: plan.durationMonths,
      maxBranches: plan.maxBranches,
      isActive: plan.isActive,
      isOffer: plan.isOffer || false,
      discountedPrice: plan.discountedPrice,
      extendedMonths: plan.extendedMonths
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  addFeature(): void {
    if (this.newFeature.trim()) {
      this.featuresList.push(this.newFeature.trim());
      this.newFeature = '';
    }
  }

  removeFeature(index: number): void {
    this.featuresList.splice(index, 1);
  }

  onSubmit(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    if (!this.ownerId) {
      this.notificationService.error('User context not found. Please refresh.');
      return;
    }

    const formValue = this.planForm.value;
    const features = this.featuresList.length > 0 ? this.featuresList : undefined;

    if (this.isEditing && this.currentPlanId) {
      const request: UpdateGymPlanRequest = {
        id: this.currentPlanId,
        gymOwnerId: this.ownerId,
        ...formValue,
        features
      };

      this.gymPlanService.updatePlan(request).subscribe({
        next: () => {
          this.notificationService.success('Plan updated successfully');
          this.loadPlans();
          this.closeModal();
        },
        error: () => this.notificationService.error('Failed to update plan')
      });
    } else {
      const request: CreateGymPlanRequest = {
        gymOwnerId: this.ownerId,
        ...formValue,
        features
      };

      this.gymPlanService.addPlan(request).subscribe({
        next: () => {
          this.notificationService.success('Plan created successfully');
          this.loadPlans();
          this.closeModal();
        },
        error: () => this.notificationService.error('Failed to create plan')
      });
    }
  }

  deletePlan(plan: GymPlan): void {
    this.confirmationService.confirm({
      title: 'Delete Plan',
      message: `Are you sure you want to delete the plan "${plan.name}"?`,
      confirmText: 'Delete',
      type: 'danger',
    }).then(confirmed => {
      if (confirmed) {
        this.gymPlanService.deletePlan(plan.id).subscribe({
          next: () => {
            this.notificationService.success('Plan deleted successfully');
            this.loadPlans();
          },
          error: () => this.notificationService.error('Failed to delete plan')
        });
      }
    });
  }

  togglePlanStatus(plan: GymPlan): void {
    const request: UpdateGymPlanRequest = {
      ...plan,
      isActive: !plan.isActive
    };

    this.gymPlanService.updatePlan(request).subscribe({
      next: () => {
        this.notificationService.success(`Plan ${plan.isActive ? 'deactivated' : 'activated'} successfully`);
        this.loadPlans();
      },
      error: () => this.notificationService.error('Failed to update plan status')
    });
  }
}
