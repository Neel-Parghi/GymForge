import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FIELD_LIMITS } from '../../../shared/constants/validation.constants';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { catchError, filter, forkJoin, map, of, take } from 'rxjs';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { MemberService } from '../../../core/services/member.service';
import { UserService } from '../../../core/services/user.service';
import { DietTrackingService } from '../../../core/services/diet-tracking.service';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { DietLogDto } from '../../../shared/models/diet-tracking.model';
import { GymAnnouncementResponse } from '../../../shared/models/announcement.model';
import { ActivePlanView, WorkoutSessionLogDto } from '../../../shared/models/workout-plan.model';
import { exerciseSetCount, resolveScheduledDay, startOfWeek, toDateKey } from '../../../shared/utils/workout-schedule';
import { mealTimeToMinutes } from '../../../shared/utils/meal-time';
import { NUTRITION_TARGET_FALLBACK, percentOf } from '../../../shared/utils/nutrition';
import { GymBuddyComponent } from './components/gym-buddy/gym-buddy.component';
import {
  ActivityRing, BuddyFacts, DailyRoutineItem, MacroProgress, NutritionToday, RoutineForm, TodayWorkout,
  UserDashboardSummary, WeekDay, WeekDayState
} from '../../../core/models/user-dashboard.model';

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const RING_RADII = { calories: 58, active: 44, goal: 30 };
const ROUTINE_PREVIEW = 5;

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink, ReactiveFormsModule, DragDropModule, GymBuddyComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDashboardComponent implements OnInit {
  readonly limits = FIELD_LIMITS;

  private authService = inject(AuthApiService);
  private memberService = inject(MemberService);
  private userService = inject(UserService);
  private dietTrackingService = inject(DietTrackingService);
  private announcementService = inject(AnnouncementService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly today = new Date();
  readonly greeting = this.greetingFor(this.today.getHours());
  readonly isFirstTime = signal(false);

  private readonly profile = toSignal(this.authService.userProfile$, { initialValue: null });

  readonly summary = signal<UserDashboardSummary | null>(null);
  readonly routines = signal<DailyRoutineItem[]>([]);
  readonly todayWorkout = signal<TodayWorkout | null>(null);
  readonly week = signal<WeekDay[]>(this.buildWeek([]));
  readonly nutrition = signal<NutritionToday | null>(null);
  readonly isAddingRoutine = signal(false);
  readonly showAllRoutines = signal(false);
  readonly announcements = signal<GymAnnouncementResponse[]>([]);
  readonly showAllAnnouncements = signal(false);

  readonly visibleAnnouncements = computed(() =>
    this.showAllAnnouncements() ? this.announcements() : this.announcements().slice(0, 1)
  );

  readonly routineForm = new FormGroup<RoutineForm>({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(FIELD_LIMITS.SHORT_TEXT)] }),
    amount: new FormControl('', { nonNullable: true, validators: [this.routineAmountValidator()] })
  });

  readonly userName = computed(() => this.summary()?.userName || this.profile()?.firstName || 'Member');

  readonly initials = computed(() => {
    const p = this.profile();
    const fromProfile = ((p?.firstName?.charAt(0) ?? '') + (p?.lastName?.charAt(0) ?? '')).toUpperCase();
    return fromProfile || this.userName().charAt(0).toUpperCase();
  });

  readonly goalTitle = computed(() => {
    const raw = this.summary()?.goalTitle || 'general_fitness';
    return raw.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  });

  readonly activity = computed(() => {
    const s = this.summary();
    const calories = s?.caloriesBurnedToday ?? 0;
    const calorieTarget = s?.targetCalories || 2500;
    const active = s?.activeTrainingTimeMinutes ?? 0;
    const activeTarget = s?.targetTrainingTime || 60;
    const goalPct = s?.goalProgressPct ?? 0;
    return {
      calories,
      calorieTarget,
      active,
      activeTarget,
      goalPct,
      rings: [
        this.ring('calories', percentOf(calories, calorieTarget)),
        this.ring('active', percentOf(active, activeTarget)),
        this.ring('goal', Math.min(goalPct, 100))
      ] as ActivityRing[]
    };
  });

  /** Personal records as medal tiles: rank, split weight ("110 kg" → 110 + kg) and a rank icon. */
  readonly prTiles = computed(() =>
    (this.summary()?.personalRecords ?? []).map((pr, i) => {
      const match = /^\s*([\d.,]+)\s*(.*)$/.exec(pr.weight ?? '');
      const rank = i + 1;
      return {
        ...pr,
        rank,
        value: match ? match[1] : pr.weight,
        unit: match ? match[2] || 'kg' : '',
        icon: rank === 1 ? 'fa-trophy' : rank <= 3 ? 'fa-medal' : 'fa-dumbbell'
      };
    })
  );

  /** Everything the gym buddy can bring up in its speech bubble. */
  readonly buddyFacts = computed<BuddyFacts>(() => {
    const s = this.summary();
    const workout = this.todayWorkout();
    const top = this.prTiles()[0];
    return {
      firstName: this.userName().split(' ')[0],
      isFirstTime: this.isFirstTime(),
      state: workout?.state ?? null,
      workoutTitle: workout?.title ?? '',
      streak: s?.workoutStreak ?? 0,
      streakAtRisk: !!s?.streakAtRisk,
      monthlyCount: s?.monthlySessionCount ?? 0,
      monthlyTarget: s?.monthlySessionTarget ?? 0,
      topRecord: top ? { name: top.name, weight: top.weight } : null,
      caloriesLeft: this.nutrition()?.left ?? null,
      readyMuscle: s?.muscleRecovery?.find(m => m.status === 'Ready')?.name ?? null,
      goalTitle: this.goalTitle()
    };
  });

  readonly doneRoutineCount = computed(() => this.routines().filter(r => r.completed).length);

  /** Keeps the card a steady height: the first few routines, the rest behind "Show all". */
  readonly visibleRoutines = computed(() => {
    const all = this.routines();
    return this.showAllRoutines() || all.length <= ROUTINE_PREVIEW + 1 ? all : all.slice(0, ROUTINE_PREVIEW);
  });

  readonly hasMoreRoutines = computed(() => this.routines().length > ROUTINE_PREVIEW + 1);

  readonly bmiCategory = computed(() => {
    const bmi = this.summary()?.bmi ?? 0;
    if (!bmi) return null;
    if (bmi < 18.5) return { label: 'Underweight', tone: 'warn' };
    if (bmi < 25) return { label: 'Normal', tone: 'good' };
    if (bmi < 30) return { label: 'Overweight', tone: 'warn' };
    return { label: 'Obese', tone: 'bad' };
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && sessionStorage.getItem('justFinishedOnboarding') === 'true') {
      this.isFirstTime.set(true);
      sessionStorage.removeItem('justFinishedOnboarding');
      setTimeout(() => this.triggerConfetti(), 500);
    }

    this.loadSummary();
    this.loadNutrition();
    this.loadAnnouncements();

    this.authService.userProfile$.pipe(
      filter(profile => !!profile?.id),
      take(1),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(profile => this.loadTraining(profile!.id));
  }

  private loadSummary(): void {
    this.userService.getDashboardSummary().pipe(
      map(res => (res?.data ?? null) as UserDashboardSummary | null),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: summary => {
        this.summary.set(summary);
        this.routines.set([...(summary?.dailyRoutines ?? [])]);
      },
      error: err => console.error('Error fetching dashboard summary:', err)
    });
  }

  private loadTraining(userId: string): void {
    this.memberService.getTrainingOverview(userId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(({ plan, logs }) => {
      this.week.set(this.buildWeek(logs));
      this.todayWorkout.set(this.buildTodayWorkout(plan, logs));
    });
  }

  private loadAnnouncements(): void {
    this.announcementService.getMyGymAnnouncementList().pipe(
      catchError(() => of([] as GymAnnouncementResponse[])),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(list => this.announcements.set(list));
  }

  private loadNutrition(): void {
    this.dietTrackingService.getUserDietLog(toDateKey(this.today)).pipe(
      map(res => res?.data ?? null),
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(log => this.nutrition.set(log ? this.buildNutrition(log) : null));
  }

  private buildTodayWorkout(plan: ActivePlanView | null, logs: WorkoutSessionLogDto[]): TodayWorkout {
    const todayKey = toDateKey(this.today);
    const planName = plan?.name ?? '';
    const loggedToday = logs.find(l => toDateKey(new Date(l.date)) === todayKey);

    if (loggedToday) {
      const isRest = loggedToday.status === 'RestDay';
      return {
        state: isRest ? 'rest' : 'done',
        planName,
        title: isRest ? 'Rest day logged' : loggedToday.dayName,
        muscles: '',
        exerciseCount: loggedToday.exercisesCompleted ?? 0,
        setCount: loggedToday.totalSets ?? 0
      };
    }

    if (!plan?.days?.length) {
      return { state: 'none', planName, title: 'No workout plan yet', muscles: '', exerciseCount: 0, setCount: 0 };
    }

    const day = resolveScheduledDay(plan.days, this.today);
    if (!day || day.isRestDay) {
      return { state: 'rest', planName, title: 'Rest day', muscles: '', exerciseCount: 0, setCount: 0 };
    }

    const exercises = day.exercises ?? [];
    return {
      state: 'ready',
      planName,
      title: day.dayName,
      muscles: (day.category ?? '').split(',').map(c => c.trim()).filter(Boolean).join(' · '),
      exerciseCount: exercises.length,
      setCount: exercises.reduce((sum, ex) => sum + exerciseSetCount(ex.sets), 0)
    };
  }

  private buildWeek(logs: WorkoutSessionLogDto[]): WeekDay[] {
    const statusByDate = new Map(logs.map(l => [toDateKey(new Date(l.date)), l.status]));
    const todayKey = toDateKey(this.today);
    const monday = startOfWeek(this.today);

    return WEEK_LABELS.map((label, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const key = toDateKey(date);
      const status = statusByDate.get(key);

      let state: WeekDayState;
      if (status) state = status === 'RestDay' ? 'rest' : 'done';
      else if (key === todayKey) state = 'today';
      else state = key < todayKey ? 'missed' : 'upcoming';

      return { label, state };
    });
  }

  private buildNutrition(log: DietLogDto): NutritionToday {
    const target = log.targetCalories || NUTRITION_TARGET_FALLBACK.calories;
    const eaten = log.totalCalories ?? 0;
    const loggedMealIds = new Set((log.mealEntries ?? []).map(e => e.sourceDietPlanMealId).filter(Boolean));
    const nextMeal = [...(log.assignedMeals ?? [])]
      .sort((a, b) => mealTimeToMinutes(a.time) - mealTimeToMinutes(b.time))
      .find(m => !loggedMealIds.has(m.id)) ?? null;

    const macro = (label: string, tone: MacroProgress['tone'], value: number, macroTarget: number): MacroProgress =>
      ({ label, tone, value: value ?? 0, target: macroTarget, pct: percentOf(value ?? 0, macroTarget) });

    return {
      eaten,
      target,
      left: Math.max(target - eaten, 0),
      pct: percentOf(eaten, target),
      nextMeal,
      macros: [
        macro('Protein', 'protein', log.totalProtein, log.targetProtein || NUTRITION_TARGET_FALLBACK.protein),
        macro('Carbs', 'carbs', log.totalCarbs, log.targetCarbs || NUTRITION_TARGET_FALLBACK.carbs),
        macro('Fats', 'fats', log.totalFats, log.targetFats || NUTRITION_TARGET_FALLBACK.fats)
      ]
    };
  }

  private ring(key: ActivityRing['key'], pct: number): ActivityRing {
    const radius = RING_RADII[key];
    const circumference = 2 * Math.PI * radius;
    return { key, radius, dash: `${(circumference * pct / 100).toFixed(1)} ${circumference.toFixed(1)}` };
  }

  private greetingFor(hour: number): string {
    if (hour < 12) return 'Good morning';
    if (hour < 19) return 'Good afternoon';
    return 'Good evening';
  }

  startTodaysWorkout(): void {
    this.router.navigate(['/user/performance']);
  }

  logMeal(): void {
    this.router.navigate(['/user/diet-tracker']);
  }

  toggleAllAnnouncements(): void {
    this.showAllAnnouncements.update(all => !all);
  }

  toggleShowAllRoutines(): void {
    this.showAllRoutines.update(all => !all);
  }

  toggleAddRoutine(): void {
    this.isAddingRoutine.update(open => !open);
  }

  toggleRoutine(item: DailyRoutineItem): void {
    this.routines.update(list => list.map(r => (r.id === item.id ? { ...r, completed: !r.completed } : r)));
    this.userService.toggleDailyRoutine(item.id).subscribe();
  }

  addRoutine(): void {
    if (this.routineForm.invalid) {
      this.routineForm.markAllAsTouched();
      return;
    }

    const { title, amount } = this.routineForm.getRawValue();
    const dto = { title: title.trim(), amount: amount.trim() || null, order: this.routines().length };

    this.userService.createDailyRoutine(dto).subscribe(res => {
      const created = (res?.data ?? res) as DailyRoutineItem;
      this.routines.update(list => [...list, created]);
      // Make sure the routine just added is visible
      if (this.hasMoreRoutines()) this.showAllRoutines.set(true);
      this.routineForm.reset();
      this.isAddingRoutine.set(false);
    });
  }

  removeRoutine(item: DailyRoutineItem): void {
    this.userService.deleteDailyRoutine(item.id).subscribe(() => {
      this.routines.update(list => list.filter(r => r.id !== item.id));
    });
  }

  dropRoutine(event: CdkDragDrop<DailyRoutineItem[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    const reordered = [...this.routines()];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    this.routines.set(reordered.map((r, index) => ({ ...r, order: index })));

    forkJoin(this.routines().map((routine, index) =>
      this.userService.updateDailyRoutine(routine.id, {
        title: routine.title,
        amount: routine.amount,
        time: routine.time,
        order: index
      })
    )).subscribe();
  }

  private routineAmountValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const strVal = value.toString().trim();
      if (strVal.length > 20) return { maxLengthExceeded: true };
      if (/^-?\d+$/.test(strVal) && strVal.replace('-', '').length > 5) return { maxDigitsExceeded: true };
      return null;
    };
  }

  private triggerConfetti(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    import('canvas-confetti').then(module => {
      const confetti = module.default || module;
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    });
  }
}
