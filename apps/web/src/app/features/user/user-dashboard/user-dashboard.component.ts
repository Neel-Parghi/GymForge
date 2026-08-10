import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { MemberService } from '../../../core/services/member.service';
import { UserService } from '../../../core/services/user.service';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DailyRoutineItem } from '../../../core/models/user-dashboard.model';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit {
  private authService = inject(AuthApiService);
  private memberService = inject(MemberService);
  private userService = inject(UserService);
  private announcementService = inject(AnnouncementService);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);

  routineForm!: FormGroup;

  showProfileAlert = false;
  userId: string = '';
  gymId: string | null = null;
  userName = 'Member';
  greeting = 'Good morning';
  greetingTheme = 'theme-morning';

  // Data for Trainer UI Replica
  todayDate: Date = new Date();
  workoutStreak = 0;

  // Row 1: Activity & Goals
  caloriesBurnedToday = 0;
  targetCalories = 0;
  activeTrainingTimeMinutes = 0;
  targetTrainingTime = 0;
  goalTitle = 'General Fitness';
  goalProgressPct = 0;

  monthlySessionCount = 0;
  monthlySessionTarget = 0;
  monthlyCompletionPct = 0;

  // Row 2: Body & Trends
  currentWeight = '0';
  bodyFat = '0';
  bmi = '0';

  // Row 3: Training & PRs
  activeWorkoutPlan: any = { name: 'No Plan Assigned' };
  activeDietPlan: any = { name: 'No Plan Assigned' };

  personalRecords: any[] = [];

  muscleRecovery: any[] = [];

  muscleHeatmap: any[] = [];

  // Original properties needed for compilation
  myGymInfo: any = null;
  announcements: any[] = [];
  activePlanName = 'No plan assigned';
  todayWorkoutName: string | null = null;
  weeklyWorkoutsCount = 0;
  isEditingCalories = false;
  dailyRoutines: any[] = [];
  newRoutineTitle = '';
  newRoutineValue = '';
  isAddingRoutine = false;

  // Ring Calculations (Apple Fitness Style)
  readonly ringCircumference = 314.159; // 2 * PI * 50
  calorieDashoffset = this.ringCircumference;
  activeTimeDashoffset = this.ringCircumference;
  streakDashoffset = this.ringCircumference;

  private routineStorageKey = 'gymforge_daily_routine';
  private routineDateKey = 'gymforge_daily_routine_date';
  private calorieTargetKey = 'gymforge_calorie_target';

  isFirstTime = false;
  isBodyCompositionOpen = false;

  toggleBodyComposition(): void {
    this.isBodyCompositionOpen = !this.isBodyCompositionOpen;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (sessionStorage.getItem('justFinishedOnboarding') === 'true') {
        this.isFirstTime = true;
        sessionStorage.removeItem('justFinishedOnboarding');
        setTimeout(() => this.triggerConfetti(), 500);
      }
    }

    this.routineForm = this.fb.group({
      title: ['', [Validators.required]],
      amount: ['', [this.routineAmountValidator()]]
    });

    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.userName = profile.firstName || 'Member';
        this.userId = profile.id;
        this.gymId = profile.gymId || null;
        this.checkProfileCompletion(profile);
        this.loadDashboardData();
      }
    });

    this.setGreeting();
    this.loadRoutine();
    this.loadCalorieTarget();

    // Animate rings on load
    setTimeout(() => this.calculateRings(), 300);
  }

  private calculateRings() {
    // Calorie Ring
    const calPct = this.targetCalories > 0 ? Math.min((this.caloriesBurnedToday / this.targetCalories) * 100, 100) : 0;
    this.calorieDashoffset = this.ringCircumference - (calPct / 100) * this.ringCircumference;

    // Active Time Ring
    const timePct = this.targetTrainingTime > 0 ? Math.min((this.activeTrainingTimeMinutes / this.targetTrainingTime) * 100, 100) : 0;
    this.activeTimeDashoffset = this.ringCircumference - (timePct / 100) * this.ringCircumference;

    // Streak Ring (weekly streak goal of 7 days)
    const streakPct = Math.min((this.workoutStreak / 7) * 100, 100);
    this.streakDashoffset = this.ringCircumference - (streakPct / 100) * this.ringCircumference;
  }

  triggerConfetti() {
    if (!isPlatformBrowser(this.platformId)) return;

    import('canvas-confetti').then((module) => {
      const confetti = module.default || module;
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    });
  }

  private checkProfileCompletion(profile: any) {
    if (!isPlatformBrowser(this.platformId)) return;

    // Show alert if no gymId or incomplete details and not dismissed
    const dismissed = localStorage.getItem('gymforge_profile_banner_dismissed');
    if (!dismissed) {
      this.showProfileAlert = true; // In a real app we might check profile fields
    }
  }

  dismissProfileAlert() {
    this.showProfileAlert = false;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('gymforge_profile_banner_dismissed', 'true');
    }
  }

  setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good morning';
      this.greetingTheme = 'theme-morning';
    } else if (hour < 19) {
      this.greeting = 'Good afternoon';
      this.greetingTheme = 'theme-afternoon';
    } else {
      this.greeting = 'Good evening';
      this.greetingTheme = 'theme-evening';
    }
  }

  loadDashboardData() {
    if (!this.userId) return;

    this.userService.getMyGym().pipe(catchError(() => of({ data: null }))).subscribe(myGym => {
      if (myGym && myGym.data) {
        this.myGymInfo = myGym.data;
        this.loadAnnouncements();
      }
    });

    this.userService.getDashboardSummary().subscribe({
      next: (res: any) => {
        const data = res.data || {};

        // Format raw goal IDs like 'weight_loss' into 'Weight Loss'
        let rawGoal = data.goalTitle || 'General Fitness';
        this.goalTitle = rawGoal.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        if (data.userName) this.userName = data.userName;
        if (data.greeting) this.greeting = data.greeting;
        this.goalProgressPct = data.goalProgressPct || 0;
        this.targetCalories = data.targetCalories || 2500;
        this.targetTrainingTime = data.targetTrainingTime || 60;

        this.caloriesBurnedToday = data.caloriesBurnedToday || 0;
        this.activeTrainingTimeMinutes = data.activeTrainingTimeMinutes || 0;
        this.workoutStreak = data.workoutStreak || 0;

        this.monthlySessionCount = data.monthlySessionCount || 0;
        this.monthlySessionTarget = data.monthlySessionTarget || 20;
        this.monthlyCompletionPct = data.monthlyCompletionPct || 0;

        this.currentWeight = data.currentWeight?.toString() || '0';
        this.bodyFat = data.bodyFat?.toString() || '0';
        this.bmi = data.bmi?.toString() || '0';

        this.activeWorkoutPlan = data.activeWorkoutPlan || { name: 'No Plan Assigned' };
        this.activePlanName = this.activeWorkoutPlan.name;
        this.activeDietPlan = data.activeDietPlan || { name: 'No Plan Assigned' };

        this.todayWorkoutName = 'Workout';

        if (data.personalRecords && data.personalRecords.length) this.personalRecords = data.personalRecords;
        if (data.muscleRecovery && data.muscleRecovery.length) this.muscleRecovery = data.muscleRecovery;
        if (data.muscleHeatmap && data.muscleHeatmap.length) this.muscleHeatmap = data.muscleHeatmap;

        this.dailyRoutines = data.dailyRoutines || [];

        setTimeout(() => this.calculateRings(), 300);
      },
      error: (err) => console.error('Error fetching dashboard summary:', err)
    });
  }

  loadAnnouncements() {
    this.announcementService.getMyGymAnnouncements().subscribe({
      next: (res) => {
        if (res && res.data) {
          const now = new Date();
          const announcementList = res.data as any[];
          this.announcements = announcementList
            .filter((a: any) => a.isActive && (!a.validUntil || new Date(a.validUntil) > now))
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      },
      error: (err) => console.error('Failed to load announcements', err)
    });
  }

  get caloriePercentage(): number {
    if (this.targetCalories === 0) return 0;
    return Math.min((this.caloriesBurnedToday / this.targetCalories) * 100, 100);
  }

  get formattedTrainingTime(): string {
    const hours = Math.floor(this.activeTrainingTimeMinutes / 60);
    const mins = this.activeTrainingTimeMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
    }
    return `${mins}m`;
  }

  loadCalorieTarget() {
    // Handled by API now
  }

  saveCalorieTarget() {
    // Ideally this calls an API to update UserPreference, but we'll mock close it for now
    this.isEditingCalories = false;
  }

  // --- Daily Routine Tracker ---
  loadRoutine() {
    // Handled by API GetDashboardSummary now
  }

  saveRoutine() {
    // Deprecated
  }

  toggleRoutine(item: DailyRoutineItem) {
    item.completed = !item.completed;
    this.userService.toggleDailyRoutine(item.id).subscribe();
  }

  routineAmountValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const strVal = value.toString().trim();
      if (strVal.length > 20) {
        return { maxLengthExceeded: true };
      }

      if (/^-?\d+$/.test(strVal)) {
        if (strVal.replace('-', '').length > 5) {
          return { maxDigitsExceeded: true };
        }
      }
      return null;
    };
  }

  addRoutine() {
    if (this.routineForm.invalid) {
      this.routineForm.markAllAsTouched();
      return;
    }

    const titleVal = this.routineForm.value.title;
    const amountVal = this.routineForm.value.amount;

    const dto = {
      title: titleVal.trim(),
      amount: amountVal?.trim() || null,
      order: this.dailyRoutines.length
    };
    this.userService.createDailyRoutine(dto).subscribe(res => {
      const newRoutine = res.data ? res.data : res;
      this.dailyRoutines.push(newRoutine);
      this.routineForm.reset();
      this.isAddingRoutine = false;
    });
  }

  removeRoutine(item: DailyRoutineItem) {
    this.userService.deleteDailyRoutine(item.id).subscribe(() => {
      this.dailyRoutines = this.dailyRoutines.filter(r => r.id !== item.id);
    });
  }

  dropRoutine(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.dailyRoutines, event.previousIndex, event.currentIndex);

    // Sync order with the backend
    const updates = this.dailyRoutines.map((routine, index) => {
      routine.order = index;
      const dto = {
        title: routine.title,
        amount: routine.amount,
        time: routine.time,
        order: index
      };
      return this.userService.updateDailyRoutine(routine.id, dto);
    });

    forkJoin(updates).subscribe();
  }
}