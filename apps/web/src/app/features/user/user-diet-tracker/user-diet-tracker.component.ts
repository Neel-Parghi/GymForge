import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DietTrackingService } from '../../../core/services/diet-tracking.service';
import { AssignedMealDto, DietLogDto } from '../../../shared/models/diet-tracking.model';
import { SegmentedTabsComponent } from '../../../shared/components/segmented-tabs/segmented-tabs.component';
import { SegmentedTab } from '../../../shared/models/segmented-tab.model';
import { mealTimeToMinutes } from '../../../shared/utils/meal-time';
import { NUTRITION_TARGET_FALLBACK, percentOf } from '../../../shared/utils/nutrition';
import { toDateKey } from '../../../shared/utils/workout-schedule';
import { FoodSearchResult, MealForm, MealType, PlannedMeal } from '../../../core/models/user-nutrition.model';

const RING_CIRCUMFERENCE = 2 * Math.PI * 80;

@Component({
  selector: 'app-user-diet-tracker',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, SegmentedTabsComponent],
  templateUrl: './user-diet-tracker.component.html',
  styleUrl: './user-diet-tracker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDietTrackerComponent implements OnInit {
  private dietTrackingService = inject(DietTrackingService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly tabs: SegmentedTab[] = [
    { id: 'today', label: 'Today' },
    { id: 'plan', label: 'My plan' },
    { id: 'library', label: 'Library' }
  ];

  readonly currentDate = signal(new Date());
  readonly dietLog = signal<DietLogDto | null>(null);
  readonly isLoading = signal(true);

  readonly showAddModal = signal(false);
  readonly selectedMealType = signal<MealType>('Custom');
  readonly isSearching = signal(false);
  readonly searchError = signal('');

  readonly searchQueryControl = new FormControl('', { nonNullable: true });
  readonly mealForm = new FormGroup<MealForm>({
    foodName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    calories: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    protein: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    carbs: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    fats: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    sourceDietPlanMealId: new FormControl<string | null>(null)
  });

  readonly isToday = computed(() => toDateKey(this.currentDate()) === toDateKey(new Date()));

  readonly totals = computed(() => {
    const log = this.dietLog();
    const target = log?.targetCalories || NUTRITION_TARGET_FALLBACK.calories;
    const eaten = log?.totalCalories ?? 0;
    return {
      eaten,
      target,
      left: Math.max(target - eaten, 0),
      over: Math.max(eaten - target, 0),
      ringDash: `${(RING_CIRCUMFERENCE * Math.min(eaten / target, 1)).toFixed(1)} ${RING_CIRCUMFERENCE.toFixed(1)}`
    };
  });

  readonly macros = computed(() => {
    const log = this.dietLog();
    const macro = (label: string, tone: string, value: number | undefined, target: number | undefined, fallback: number) => {
      const t = target || fallback;
      const v = value ?? 0;
      return { label, tone, value: v, target: t, pct: percentOf(v, t) };
    };
    return [
      macro('Protein', 'protein', log?.totalProtein, log?.targetProtein, NUTRITION_TARGET_FALLBACK.protein),
      macro('Carbs', 'carbs', log?.totalCarbs, log?.targetCarbs, NUTRITION_TARGET_FALLBACK.carbs),
      macro('Fats', 'fats', log?.totalFats, log?.targetFats, NUTRITION_TARGET_FALLBACK.fats)
    ];
  });

  readonly plannedMeals = computed<PlannedMeal[]>(() => {
    const log = this.dietLog();
    const entries = log?.mealEntries ?? [];
    const sorted = [...(log?.assignedMeals ?? [])].sort((a, b) => mealTimeToMinutes(a.time) - mealTimeToMinutes(b.time));
    const withEntries = sorted.map(meal => ({ meal, entry: entries.find(e => e.sourceDietPlanMealId === meal.id) ?? null }));
    const nextId = withEntries.find(m => !m.entry)?.meal.id;
    return withEntries.map(m => ({ ...m, isNext: m.meal.id === nextId }));
  });

  readonly loggedPlannedCount = computed(() => this.plannedMeals().filter(m => m.entry).length);

  /** Food logged that isn't one of the planned meals. */
  readonly otherEntries = computed(() => {
    const plannedIds = new Set((this.dietLog()?.assignedMeals ?? []).map(m => m.id));
    return (this.dietLog()?.mealEntries ?? []).filter(e => !e.sourceDietPlanMealId || !plannedIds.has(e.sourceDietPlanMealId));
  });

  ngOnInit(): void {
    this.loadLogForDate(this.currentDate());
  }

  loadLogForDate(date: Date): void {
    this.isLoading.set(true);
    this.dietTrackingService.getUserDietLog(toDateKey(date))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.dietLog.set((res?.data ?? res) as DietLogDto);
          this.isLoading.set(false);
        },
        error: err => {
          console.error('Failed to load diet log', err);
          this.dietLog.set(null);
          this.isLoading.set(false);
        }
      });
  }

  goToTab(tab: string): void {
    if (tab === 'plan') this.router.navigate(['/user/diet-planner']);
    if (tab === 'library') this.router.navigate(['/user/diet-planner'], { queryParams: { view: 'library' } });
  }

  shiftDay(offset: number): void {
    const d = new Date(this.currentDate());
    d.setDate(d.getDate() + offset);
    this.currentDate.set(d);
    this.loadLogForDate(d);
  }

  openAddModal(): void {
    this.selectedMealType.set('Custom');
    this.mealForm.reset({ foodName: '', calories: 0, protein: 0, carbs: 0, fats: 0, sourceDietPlanMealId: null });
    this.showAddModal.set(true);
  }

  openEditAssignedMeal(meal: AssignedMealDto): void {
    this.selectedMealType.set('Assigned');
    this.mealForm.reset({
      foodName: meal.items ? meal.items : meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      sourceDietPlanMealId: meal.id
    });
    this.showAddModal.set(true);
  }

  closeModal(): void {
    this.showAddModal.set(false);
    this.searchQueryControl.reset('');
    this.searchError.set('');
  }

  searchFood(): void {
    const query = this.searchQueryControl.value.trim();
    if (!query) return;
    this.isSearching.set(true);
    this.searchError.set('');
    this.dietTrackingService.searchFood(query).subscribe({
      next: result => {
        const food = ((result as { data?: FoodSearchResult })?.data ?? result) as FoodSearchResult;
        this.mealForm.patchValue({
          foodName: food.name,
          calories: Math.round(food.calories),
          protein: Math.round(food.protein * 10) / 10,
          carbs: Math.round(food.carbs * 10) / 10,
          fats: Math.round(food.fats * 10) / 10
        });
        this.isSearching.set(false);
      },
      error: () => {
        this.searchError.set('Food not found. Please enter the details manually.');
        this.isSearching.set(false);
      }
    });
  }

  saveMeal(): void {
    if (this.mealForm.invalid) return;

    const dateKey = toDateKey(this.currentDate());
    const { sourceDietPlanMealId, ...values } = this.mealForm.getRawValue();
    const entry = {
      logDate: dateKey,
      mealType: this.selectedMealType(),
      ...values,
      ...(sourceDietPlanMealId ? { sourceDietPlanMealId } : {})
    };

    this.closeModal();
    this.dietTrackingService.invalidateDietLogCache(dateKey);
    this.dietTrackingService.addMealEntry(entry).subscribe({
      next: updatedLog => this.applyUpdatedLog(updatedLog),
      error: err => console.error(err)
    });
  }

  removeMeal(mealEntryId: string): void {
    this.dietTrackingService.invalidateDietLogCache(toDateKey(this.currentDate()));
    this.dietTrackingService.removeMealEntry(mealEntryId).subscribe({
      next: updatedLog => this.applyUpdatedLog(updatedLog),
      error: err => console.error(err)
    });
  }

  /** Add/remove respond with the updated day log (typed as ApiResponse<null> in the service), with or without an envelope. */
  private applyUpdatedLog(response: unknown): void {
    const body = response as (DietLogDto & { data?: DietLogDto }) | null;
    this.dietLog.set(body?.data ?? body);
  }

}
