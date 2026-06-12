import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { DietTemplateCreatorComponent } from './diet-template-creator/diet-template-creator.component';
import { DietPlanService } from '../../../core/services/diet-plan.service';

@Component({
  selector: 'app-diet-planner',
  standalone: true,
  imports: [CommonModule, DietTemplateCreatorComponent],
  templateUrl: './diet-planner.component.html',
  styleUrl: './diet-planner.component.scss'
})
export class PTDietPlannerComponent implements OnInit {
  private notification = inject(NotificationService);
  private dietPlanService = inject(DietPlanService);

  dietPlans: any[] = [];
  showCreateModal = false;
  editingPlan: any = null;
  drawerPlan: any = null;

  openMealDrawer(plan: any): void {
    this.drawerPlan = plan;
  }

  closeMealDrawer(): void {
    this.drawerPlan = null;
  }

  ngOnInit(): void {
    this.loadDietPlans();
  }

  loadDietPlans(): void {
    this.dietPlanService.getPlans().subscribe({
      next: (plans) => {
        this.dietPlans = plans || [];
      },
      error: (err) => {
        console.error('Failed to load diet templates:', err);
        this.notification.error('Failed to load diet templates.');
      }
    });
  }

  openCreateModal(): void {
    this.editingPlan = null;
    this.showCreateModal = true;
  }

  openEditModal(plan: any): void {
    this.editingPlan = plan;
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.editingPlan = null;
  }

  onSaveTemplate(planData: any): void {
    if (this.editingPlan) {
      this.dietPlanService.updatePlan(this.editingPlan.id, planData).subscribe({
        next: () => {
          this.notification.success('Diet template updated successfully!');
          this.loadDietPlans();
          this.closeCreateModal();
        },
        error: (err) => {
          console.error('Failed to update template:', err);
          this.notification.error('Failed to update diet template.');
        }
      });
    } else {
      this.dietPlanService.createPlan(planData).subscribe({
        next: () => {
          this.notification.success('Diet template created successfully in your library!');
          this.loadDietPlans();
          this.closeCreateModal();
        },
        error: (err) => {
          console.error('Failed to create template:', err);
          this.notification.error('Failed to create diet template.');
        }
      });
    }
  }

  deleteTemplate(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this diet template?')) {
      this.dietPlanService.deletePlan(id).subscribe({
        next: () => {
          this.notification.success('Template deleted successfully.');
          this.loadDietPlans();
        },
        error: (err) => {
          console.error('Failed to delete template:', err);
          this.notification.error('Failed to delete diet template.');
        }
      });
    }
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
