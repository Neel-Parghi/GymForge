import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { DietTemplateCreatorComponent } from './components/diet-template-creator/diet-template-creator.component';

@Component({
  selector: 'app-diet-planner',
  standalone: true,
  imports: [CommonModule, DietTemplateCreatorComponent],
  templateUrl: './diet-planner.component.html',
  styleUrl: './diet-planner.component.scss'
})
export class PTDietPlannerComponent implements OnInit {
  private notification = inject(NotificationService);

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
    // Load local storage mock diet plans for UI demonstration first
    this.loadMockDietPlans();
  }

  loadMockDietPlans(): void {
    const local = localStorage.getItem('gymforge_diet_plans');
    if (local) {
      this.dietPlans = JSON.parse(local);
    } else {
      this.dietPlans = [
        {
          id: 'diet-mock-1',
          name: 'Lean Bulking 3000 kcal Plan',
          description: 'High-protein diet designed for clean muscle mass accrual with healthy fats and minimal fat gain.',
          calories: 3000,
          protein: 180,
          carbs: 360,
          fats: 80,
          goal: 'Muscle Gain',
          meals: [
            { name: 'Breakfast (08:00 AM)', calories: 650, protein: 45, items: '100g Rolled Oats, 4 Egg Whites, 1 Scoop Whey, 1 Banana, 15g Almonds' },
            { name: 'Mid-Day Snack (11:30 AM)', calories: 400, protein: 30, items: '200g Greek Yogurt (0% Fat), 100g Berries, 30g Honey' },
            { name: 'Lunch (02:00 PM)', calories: 750, protein: 50, items: '150g Grilled Chicken Breast, 150g Basmati Rice, Broccoli, 1 tbsp Olive Oil' },
            { name: 'Post-Workout (06:00 PM)', calories: 500, protein: 55, items: '2 Scoops Hydrolyzed Whey, 75g Cream of Rice, 1 Apple' },
            { name: 'Dinner (08:30 PM)', calories: 700, protein: 45, items: '150g Salmon Fillet, 200g Sweet Potatoes, Asparagus' }
          ]
        },
        {
          id: 'diet-mock-2',
          name: 'Keto Cut & Shred 1800 kcal',
          description: 'Ketogenic low-carbohydrate fat loss plan tailored for rapid glycogen depletion and deep ketosis.',
          calories: 1800,
          protein: 140,
          carbs: 20,
          fats: 125,
          goal: 'Fat Loss',
          meals: [
            { name: 'Morning Fuel (09:00 AM)', calories: 550, protein: 45, items: '3 Whole Eggs scrambled, 2 strips Turkey Bacon, 1/2 Avocado, Coffee with 1 tbsp Butter' },
            { name: 'Keto Lunch (01:30 PM)', calories: 600, protein: 50, items: '150g Ribeye Steak, Large Spinach salad with Olive Oil dressing, 30g Feta' },
            { name: 'Dinner (08:00 PM)', calories: 650, protein: 45, items: '180g Baked Salmon, Spinach sauteed in Garlic Butter, 15g Walnuts' }
          ]
        }
      ];
      this.saveToLocalStorage();
    }
  }

  saveToLocalStorage(): void {
    localStorage.setItem('gymforge_diet_plans', JSON.stringify(this.dietPlans));
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
      const idx = this.dietPlans.findIndex(p => p.id === this.editingPlan.id);
      if (idx !== -1) {
        this.dietPlans[idx] = planData;
      }
      this.notification.success('Diet template updated successfully!');
    } else {
      this.dietPlans.unshift(planData);
      this.notification.success('Diet template created successfully in your library!');
    }

    this.saveToLocalStorage();
    this.closeCreateModal();
  }

  deleteTemplate(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this diet template?')) {
      this.dietPlans = this.dietPlans.filter(p => p.id !== id);
      this.saveToLocalStorage();
      this.notification.success('Template deleted successfully.');
    }
  }

  // Display helpers for cards list
  getMacroPercentageForCard(plan: any, macroType: 'protein' | 'carbs' | 'fats'): number {
    const protein = plan.protein || 0;
    const carbs = plan.carbs || 0;
    const fats = plan.fats || 0;

    const pKcal = protein * 4;
    const cKcal = carbs * 4;
    const fKcal = fats * 9;
    const totalKcal = pKcal + cKcal + fKcal;

    if (totalKcal === 0) return 0;
    if (macroType === 'protein') return Math.round((pKcal / totalKcal) * 100);
    if (macroType === 'carbs') return Math.round((cKcal / totalKcal) * 100);
    return Math.round((fKcal / totalKcal) * 100);
  }

  getMealTime(name: string): string {
    if (!name) return '08:00 AM';
    const match = name.match(/\(([^)]+)\)/);
    return match ? match[1] : '08:00 AM';
  }

  getMealTitle(name: string): string {
    if (!name) return 'Meal';
    return name.replace(/\s*\([^)]+\)/, '').trim();
  }
}
