import { Component, OnInit, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { DietTemplateCreatorComponent } from './diet-template-creator/diet-template-creator.component';
import { ConfirmationPopupComponent } from '../confirmation-popup/confirmation-popup.component';
import { DietPlanService } from '../../../core/services/diet-plan.service';
import { CONSTANTS } from '../../../core/constants/constants';
import { TruncatePipe } from '../../pipes/truncate.pipe';

@Component({
  selector: 'app-diet-library',
  standalone: true,
  imports: [CommonModule, DietTemplateCreatorComponent, ConfirmationPopupComponent, TruncatePipe],
  templateUrl: './diet-library.component.html',
  styleUrl: './diet-library.component.scss'
})
export class DietLibraryComponent implements OnInit {
  private notification = inject(NotificationService);
  private dietPlanService = inject(DietPlanService);
  private authService = inject(AuthApiService);

  @Input() currentUserId?: string;
  @Input() activeDietId?: string;
  @Input() isCardView: boolean = false;
  @Output() onAssign = new EventEmitter<any>();

  loggedInUserId: string = '';

  dietPlans: any[] = [];
  showCreateModal = false;
  editingPlan: any = null;
  drawerPlan: any = null;

  showDeleteConfirm = false;
  deletingPlanId: string | null = null;

  openMealDrawer(plan: any): void {
    this.drawerPlan = plan;
  }

  closeMealDrawer(): void {
    this.drawerPlan = null;
  }

  ngOnInit(): void {
    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.loggedInUserId = profile.id;
        this.loadDietPlans();
      }
    });
  }

  loadDietPlans(forceRefresh = false): void {
    if (!this.loggedInUserId) return;
    this.dietPlanService.getPlans(undefined, forceRefresh).subscribe({
      next: (plans) => {
        if (!this.currentUserId) {
          // Trainer mode: Trainer sees ONLY their own generic templates
          this.dietPlans = (plans || []).filter((p: any) => !p.isCustom);
        } else {
          // User mode: User sees global templates + their own plans
          this.dietPlans = (plans || []).filter((p: any) => !p.isCustom || p.createdBy === this.currentUserId);
        }
      },
      error: (err) => {
        console.error('Failed to load diet templates:', err);
        this.notification.error(CONSTANTS.DIET_PLANNER_MODULE.LOAD_ERROR);
      }
    });
  }

  openCreateModal(): void {
    this.editingPlan = null;
    this.showCreateModal = true;
  }

  openEditModal(plan: any): void {
    if (!this.canEdit(plan)) {
      // Inherit mode: duplicate plan without ID
      this.editingPlan = { ...plan, id: undefined, createdBy: this.currentUserId, isCustom: true };
    } else {
      this.editingPlan = plan;
    }
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.editingPlan = null;
  }

  onSaveTemplate(planData: any): void {
    if (this.editingPlan && this.editingPlan.id) {
      this.dietPlanService.updatePlan(this.editingPlan.id, planData).subscribe({
        next: () => {
          this.notification.success(CONSTANTS.DIET_PLANNER_MODULE.UPDATE_SUCCESS);
          this.loadDietPlans(true);
          this.closeCreateModal();
        },
        error: (err) => {
          console.error('Failed to update template:', err);
          this.notification.error(CONSTANTS.DIET_PLANNER_MODULE.UPDATE_ERROR);
        }
      });
    } else {
      this.dietPlanService.createPlan(planData).subscribe({
        next: () => {
          this.notification.success(CONSTANTS.DIET_PLANNER_MODULE.CREATE_SUCCESS);
          this.loadDietPlans(true);
          this.closeCreateModal();
        },
        error: (err) => {
          console.error('Failed to create template:', err);
          this.notification.error(CONSTANTS.DIET_PLANNER_MODULE.CREATE_ERROR);
        }
      });
    }
  }

  deleteTemplate(id: string, event: Event): void {
    event.stopPropagation();
    this.deletingPlanId = id;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.deletingPlanId) return;
    this.dietPlanService.deletePlan(this.deletingPlanId).subscribe({
      next: () => {
        this.notification.success(CONSTANTS.DIET_PLANNER_MODULE.DELETE_SUCCESS);
        this.loadDietPlans(true);
        this.closeDeleteConfirm();
      },
      error: (err) => {
        console.error('Failed to delete template:', err);
        this.notification.error(CONSTANTS.DIET_PLANNER_MODULE.DELETE_ERROR);
        this.closeDeleteConfirm();
      }
    });
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.deletingPlanId = null;
  }

  assignTemplate(plan: any, event: Event): void {
    event.stopPropagation();
    this.onAssign.emit(plan);
  }

  canEdit(plan: any): boolean {
    if (!this.currentUserId) return true; // Trainer mode
    return plan.createdBy && plan.createdBy.toLowerCase() === this.currentUserId.toLowerCase(); // User mode
  }

  getMacroPercentageForCard(plan: any, macroType: 'protein' | 'carbs' | 'fats'): number {
    const protein = plan.protein || 0;
    const carbs = plan.carbs || 0;
    const fats = plan.fats || 0;

    const pKcal = protein * 4;
    const cKcal = carbs * 4;
    const fKcal = fats * 9;
    const totalKcal = pKcal + cKcal + fKcal;

    if (totalKcal === 0)
      return 0;

    if (macroType === 'protein')
      return Math.round((pKcal / totalKcal) * 100);

    if (macroType === 'carbs')
      return Math.round((cKcal / totalKcal) * 100);

    return Math.round((fKcal / totalKcal) * 100);
  }

  getMealTime(meal: any): string {
    if (!meal)
      return '08:00 AM';

    if (meal.time)
      return meal.time;

    const name = meal.name || '';
    const match = name.match(/\(([^)]+)\)/);

    return match ? match[1] : '08:00 AM';
  }

  getMealTitle(meal: any): string {
    if (!meal)
      return 'Meal';

    if (meal.time)
      return meal.name;

    const name = meal.name || 'Meal';

    return name.replace(/\s*\([^)]+\)/, '').trim();
  }
}
