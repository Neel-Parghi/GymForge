import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../../../shared/models/dropdown.model';

@Component({
  selector: 'app-diet-template-creator',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DropdownComponent],
  templateUrl: './diet-template-creator.component.html',
  styleUrl: './diet-template-creator.component.scss'
})
export class DietTemplateCreatorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);

  @Input() plan: any = null;
  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  createForm!: FormGroup;
  activeFormTab: 'details' | 'meals' = 'details';
  expandedMealIndex = 0;

  goalOptions: DropdownOption[] = [
    { value: 'Muscle Gain', label: 'Muscle Gain (Bulking)', icon: 'fa-solid fa-dumbbell' },
    { value: 'Fat Loss', label: 'Fat Loss (Cutting)', icon: 'fa-solid fa-fire' },
    { value: 'Maintenance', label: 'Maintenance & Health', icon: 'fa-solid fa-heart' }
  ];

  ngOnInit(): void {
    this.initForm(this.plan);
  }

  initForm(plan?: any): void {
    this.createForm = this.fb.group({
      name: [plan?.name || '', [Validators.required, Validators.minLength(3)]],
      goal: [plan?.goal || 'Muscle Gain', [Validators.required]],
      protein: [plan?.protein || 150, [Validators.required, Validators.min(0)]],
      carbs: [plan?.carbs || 200, [Validators.required, Validators.min(0)]],
      fats: [plan?.fats || 70, [Validators.required, Validators.min(0)]],
      meals: this.fb.array([])
    });

    if (plan?.meals && plan.meals.length > 0) {
      plan.meals.forEach((m: any) => this.addMeal(m));
    } else {
      this.addMeal();
    }
  }

  get meals(): FormArray {
    return this.createForm.get('meals') as FormArray;
  }

  addMeal(meal?: any): void {
    const mealGroup = this.fb.group({
      name: [meal?.name || '', [Validators.required]],
      calories: [meal?.calories || 400, [Validators.required, Validators.min(0)]],
      protein: [meal?.protein || 30, [Validators.required, Validators.min(0)]],
      items: [meal?.items || '']
    });
    this.meals.push(mealGroup);
    this.expandedMealIndex = this.meals.length - 1;
  }

  toggleMealExpand(index: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.expandedMealIndex = this.expandedMealIndex === index ? -1 : index;
  }

  removeMeal(index: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.meals.length <= 1) {
      this.notification.warning('A diet template must have at least one meal.');
      return;
    }
    this.meals.removeAt(index);
    if (this.expandedMealIndex === index) {
      this.expandedMealIndex = Math.max(0, index - 1);
    } else if (this.expandedMealIndex > index) {
      this.expandedMealIndex--;
    }
  }

  get computedCalories(): number {
    if (!this.createForm) return 0;
    const p = this.createForm.get('protein')?.value || 0;
    const c = this.createForm.get('carbs')?.value || 0;
    const f = this.createForm.get('fats')?.value || 0;
    return (p * 4) + (c * 4) + (f * 9);
  }

  get macroPercentages(): { protein: number, carbs: number, fats: number } {
    const p = this.createForm?.get('protein')?.value || 0;
    const c = this.createForm?.get('carbs')?.value || 0;
    const f = this.createForm?.get('fats')?.value || 0;

    const pKcal = p * 4;
    const cKcal = c * 4;
    const fKcal = f * 9;
    const total = pKcal + cKcal + fKcal;

    if (total === 0) return { protein: 0, carbs: 0, fats: 0 };
    return {
      protein: Math.round((pKcal / total) * 100),
      carbs: Math.round((cKcal / total) * 100),
      fats: Math.round((fKcal / total) * 100)
    };
  }

  get mealsTotalCalories(): number {
    const mealList = this.meals.value || [];
    return mealList.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
  }

  getCircumference(): number {
    return 377;
  }

  getProteinOffset(): number {
    const pct = this.macroPercentages.protein;
    return this.getCircumference() - (pct / 100) * this.getCircumference();
  }

  getCarbsOffset(): number {
    const pct = this.macroPercentages.carbs;
    const proteinPct = this.macroPercentages.protein;
    return this.getCircumference() - ((pct + proteinPct) / 100) * this.getCircumference();
  }

  getFatsOffset(): number {
    const pct = this.macroPercentages.fats;
    const prevPct = this.macroPercentages.protein + this.macroPercentages.carbs;
    return this.getCircumference() - ((pct + prevPct) / 100) * this.getCircumference();
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const val = this.createForm.getRawValue();
    const planData = {
      id: this.plan?.id || 'diet-mock-' + (Date.now()),
      name: val.name,
      description: '',
      calories: this.computedCalories,
      protein: val.protein,
      carbs: val.carbs,
      fats: val.fats,
      goal: val.goal,
      meals: val.meals
    };

    this.save.emit(planData);
  }
}
