import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { DietTrackingService } from '../../../core/services/diet-tracking.service';

@Component({
  selector: 'app-user-diet-tracker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-diet-tracker.component.html',
  styleUrls: ['./user-diet-tracker.component.scss']
})
export class UserDietTrackerComponent implements OnInit {
  currentDate = new Date();
  dietLog: any = null;
  isLoading = true;

  showAddModal = false;
  selectedMealType = 'Breakfast';

  // Collapsed by default on mobile — the macro ring/bars expand on tap to cut down scroll length.
  macrosExpanded = false;

  mealForm: FormGroup;
  searchQueryControl = new FormControl('');
  isSearching = false;
  searchError = '';

  constructor(
    private dietTrackingService: DietTrackingService,
    private fb: FormBuilder
  ) {
    this.mealForm = this.fb.group({
      foodName: ['', Validators.required],
      calories: [0, [Validators.required, Validators.min(0)]],
      protein: [0, [Validators.required, Validators.min(0)]],
      carbs: [0, [Validators.required, Validators.min(0)]],
      fats: [0, [Validators.required, Validators.min(0)]],
      sourceDietPlanMealId: [null]
    });
  }

  ngOnInit() {
    this.loadLogForDate(this.currentDate);
  }

  /** Formats a date as YYYY-MM-DD using local time (avoids UTC offset shifting the day) */
  private toLocalDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  loadLogForDate(date: Date) {
    this.isLoading = true;
    const dateStr = this.toLocalDateStr(date);
    this.dietTrackingService.getUserDietLog(dateStr).subscribe({
      next: (res) => {
        this.dietLog = res.data || res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load diet log', err);
        this.isLoading = false;
      }
    });
  }

  previousDay() {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() - 1);
    this.currentDate = d;
    this.loadLogForDate(this.currentDate);
  }

  nextDay() {
    const d = new Date(this.currentDate);
    d.setDate(d.getDate() + 1);
    this.currentDate = d;
    this.loadLogForDate(this.currentDate);
  }

  get consumedFoods() {
    if (!this.dietLog || !this.dietLog.mealEntries) return [];
    return this.dietLog.mealEntries;
  }

  get assignedMealsPending() {
    if (!this.dietLog || !this.dietLog.assignedMeals) return [];
    return [...this.dietLog.assignedMeals].sort((a: any, b: any) => {
      return this.parseTime(a.time) - this.parseTime(b.time);
    });
  }

  isAssignedMealLogged(meal: any): boolean {
    return this.consumedFoods.some((e: any) => e.sourceDietPlanMealId === meal.id);
  }

  parseTime(timeStr: string): number {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3] ? match[3].toUpperCase() : null;

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }
  openAddModal() {
    this.selectedMealType = 'Custom';
    this.mealForm.reset({
      foodName: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      sourceDietPlanMealId: null
    });
    this.showAddModal = true;
  }

  openEditAssignedMeal(meal: any) {
    this.selectedMealType = 'Assigned';
    this.mealForm.reset({
      foodName: meal.items ? meal.items : meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      sourceDietPlanMealId: meal.id
    });
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.searchQueryControl.reset('');
    this.searchError = '';
  }

  searchFood() {
    const query = this.searchQueryControl.value?.trim();
    if (!query) return;
    this.isSearching = true;
    this.searchError = '';
    this.dietTrackingService.searchFood(query).subscribe({
      next: (result: any) => {
        const food = result.data ?? result;
        this.mealForm.patchValue({
          foodName: food.name,
          calories: Math.round(food.calories),
          protein: Math.round(food.protein * 10) / 10,
          carbs: Math.round(food.carbs * 10) / 10,
          fats: Math.round(food.fats * 10) / 10
        });
        this.isSearching = false;
      },
      error: () => {
        this.searchError = 'Food not found. Please enter the details manually.';
        this.isSearching = false;
      }
    });
  }

  saveMeal() {
    if (this.mealForm.invalid) return;

    const entry = {
      logDate: this.toLocalDateStr(this.currentDate),
      mealType: this.selectedMealType,
      ...this.mealForm.value
    };

    this.showAddModal = false;
    this.closeModal();

    this.dietTrackingService.invalidateDietLogCache(this.toLocalDateStr(this.currentDate));
    this.dietTrackingService.addMealEntry(entry).subscribe({
      next: (updatedLog: any) => {
        this.dietLog = updatedLog.data ?? updatedLog;
      },
      error: (err) => console.error(err)
    });
  }



  removeMeal(mealEntryId: string) {
    this.dietTrackingService.invalidateDietLogCache(this.toLocalDateStr(this.currentDate));
    this.dietTrackingService.removeMealEntry(mealEntryId).subscribe({
      next: (updatedLog: any) => {
        this.dietLog = updatedLog.data ?? updatedLog;
      },
      error: (err) => console.error(err)
    });
  }

  getPercentage(actual: number, target: number): number {
    if (!target || target === 0) return 0;
    const percent = (actual / target) * 100;
    return percent > 100 ? 100 : percent;
  }
}
