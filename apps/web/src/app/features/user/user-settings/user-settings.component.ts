import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, merge, scan, startWith } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { KCAL_PER_GRAM, macroCalorieSplit } from '../../../shared/utils/nutrition';
import { FitnessForm, FitnessValue, GoalOption, NotificationsForm, UserPreferences } from '../../../core/models/user-settings.model';

const WEIGHT_STEP = 0.5;

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSettingsComponent implements OnInit {
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  readonly goals: GoalOption[] = [
    { value: 'Weight Loss', label: 'Weight loss', hint: 'Calorie deficit', icon: 'fa-solid fa-weight-scale' },
    { value: 'Muscle Gain', label: 'Muscle gain', hint: 'Lean surplus', icon: 'fa-solid fa-dumbbell' },
    { value: 'Endurance', label: 'Endurance', hint: 'Go longer', icon: 'fa-solid fa-person-running' },
    { value: 'Flexibility', label: 'Flexibility', hint: 'Move freely', icon: 'fa-solid fa-child-reaching' },
    { value: 'General Fitness', label: 'General fitness', hint: 'Feel good overall', icon: 'fa-solid fa-heart-pulse' }
  ];

  readonly macroFields = [
    { key: 'targetProtein', label: 'Protein', tone: 'protein' },
    { key: 'targetCarbs', label: 'Carbs', tone: 'carbs' },
    { key: 'targetFats', label: 'Fats', tone: 'fats' }
  ] as const;

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);

  readonly fitnessForm = new FormGroup<FitnessForm>({
    primaryGoal: new FormControl('', { nonNullable: true }),
    targetWeight: new FormControl<number | null>(null, [Validators.min(0), Validators.max(500)]),
    targetCalories: new FormControl<number | null>(null, [Validators.min(0), Validators.max(10000)]),
    targetTrainingTime: new FormControl<number | null>(null, [Validators.min(0), Validators.max(600)]),
    targetProtein: new FormControl<number | null>(null, [Validators.min(0), Validators.max(1000)]),
    targetCarbs: new FormControl<number | null>(null, [Validators.min(0), Validators.max(1000)]),
    targetFats: new FormControl<number | null>(null, [Validators.min(0), Validators.max(1000)])
  });

  readonly notificationsForm = new FormGroup<NotificationsForm>({
    emailNotifications: new FormControl(true, { nonNullable: true }),
    workoutReminders: new FormControl(true, { nonNullable: true })
  });

  private readonly fitness = toSignal(
    this.fitnessForm.valueChanges.pipe(map(() => this.fitnessForm.getRawValue()), startWith(this.fitnessForm.getRawValue())),
    { requireSync: true }
  );

  private readonly formChanges = toSignal(
    merge(this.fitnessForm.valueChanges, this.notificationsForm.valueChanges).pipe(scan(count => count + 1, 0)),
    { initialValue: 0 }
  );

  readonly isDirty = computed(() => {
    this.formChanges();
    return this.fitnessForm.dirty || this.notificationsForm.dirty;
  });

  readonly macroCheck = computed(() => {
    const f = this.fitness();
    if (f.targetProtein == null && f.targetCarbs == null && f.targetFats == null) return null;
    const kcal = Math.round(
      (f.targetProtein ?? 0) * KCAL_PER_GRAM.protein +
      (f.targetCarbs ?? 0) * KCAL_PER_GRAM.carbs +
      (f.targetFats ?? 0) * KCAL_PER_GRAM.fats
    );
    const target = f.targetCalories ?? 0;
    const matches = target > 0 && Math.abs(kcal - target) / target <= 0.05;
    const note = target <= 0 ? '.' : matches ? ', matching your daily target.' : `. Your daily target is ${target} kcal.`;
    return { kcal, target, matches, note, split: this.macroSplit(f) };
  });

  ngOnInit(): void {
    this.userService.getPreferences().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        const data = (res as { data?: UserPreferences })?.data;
        if (data) {
          this.fitnessForm.reset({
            primaryGoal: data.primaryGoal ?? '',
            targetWeight: data.targetWeight ?? null,
            targetCalories: data.targetCalories ?? null,
            targetTrainingTime: data.targetTrainingTime ?? null,
            targetProtein: data.targetProtein ?? null,
            targetCarbs: data.targetCarbs ?? null,
            targetFats: data.targetFats ?? null
          });
          this.notificationsForm.reset({
            emailNotifications: data.emailNotificationsEnabled ?? true,
            workoutReminders: data.workoutRemindersEnabled ?? true
          });
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.error('Failed to load preferences.');
      }
    });
  }

  private macroSplit(f: FitnessValue): { tone: string; pct: number }[] {
    const split = macroCalorieSplit(f.targetProtein ?? 0, f.targetCarbs ?? 0, f.targetFats ?? 0);
    return [
      { tone: 'protein', pct: split.protein },
      { tone: 'carbs', pct: split.carbs },
      { tone: 'fats', pct: split.fats }
    ].filter(part => part.pct > 0);
  }

  selectGoal(value: string): void {
    const control = this.fitnessForm.controls.primaryGoal;
    control.setValue(value);
    control.markAsDirty();
  }

  stepWeight(direction: 1 | -1): void {
    const control = this.fitnessForm.controls.targetWeight;
    const next = Math.round(((control.value ?? 0) + direction * WEIGHT_STEP) * 10) / 10;
    control.setValue(Math.min(Math.max(next, 0), 500));
    control.markAsDirty();
  }

  saveChanges(): void {
    if (this.fitnessForm.invalid) {
      this.fitnessForm.markAllAsTouched();
      this.notificationService.error('Please check the highlighted values.');
      return;
    }

    this.isSaving.set(true);
    const notifications = this.notificationsForm.getRawValue();
    const payload = {
      ...this.fitnessForm.getRawValue(),
      emailNotificationsEnabled: notifications.emailNotifications,
      workoutRemindersEnabled: notifications.workoutReminders
    };

    this.userService.updatePreferences(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.fitnessForm.markAsPristine();
        this.notificationsForm.markAsPristine();
        this.fitnessForm.updateValueAndValidity();
        this.notificationService.success('Settings saved.');
      },
      error: () => {
        this.isSaving.set(false);
        this.notificationService.error('Failed to save settings.');
      }
    });
  }
}
