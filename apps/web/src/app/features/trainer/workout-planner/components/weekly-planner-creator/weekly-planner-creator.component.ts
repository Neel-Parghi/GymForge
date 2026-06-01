import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Exercise } from '../../../../../shared/models/exercise.model';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../../../shared/models/dropdown.model';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ConfirmationPopupComponent } from '../../../../../shared/components/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-weekly-planner-creator',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DropdownComponent, ConfirmationPopupComponent],
  templateUrl: './weekly-planner-creator.component.html',
  styleUrl: './weekly-planner-creator.component.scss'
})
export class WeeklyPlannerCreatorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);

  copiedWorkout: any = null;
  showConfirmPopup = false;
  confirmMessage = '';

  @Input() categories: string[] = [];
  @Input() exercisesMap: { [category: string]: Exercise[] } = {};
  @Input() editData: any = null;

  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  createWeeklyForm!: FormGroup;
  activeDayTab = 0;
  activeStep: 'details' | 'plan' = 'details';

  levelOptions: DropdownOption[] = [
    { label: 'Beginner', value: 'Beginner' },
    { label: 'Intermediate', value: 'Intermediate' },
    { label: 'Advanced', value: 'Advanced' }
  ];

  goalOptions: DropdownOption[] = [
    { label: 'Hypertrophy', value: 'Hypertrophy' },
    { label: 'Strength & Power', value: 'Strength & Power' },
    { label: 'Fat Loss', value: 'Fat Loss' }
  ];

  dayTypeOptions: DropdownOption[] = [
    { label: 'Workout', value: 'workout' },
    { label: 'Rest', value: 'rest' }
  ];

  getExercisesDropdownOptions(dayIdx: number, currentExIdx?: number): DropdownOption[] {
    const dayGroup = this.weeklyCalendarDays.at(dayIdx);
    const categories = dayGroup.get('targetCategories')?.value || ['Back'];
    const exercises = this.getExercisesForCategories(categories);

    // Collect names already selected in other exercise rows for this day
    const usedNames = new Set<string>();
    const exArray = this.getWeeklyExercises(dayIdx);
    exArray.controls.forEach((ctrl, idx) => {
      if (idx !== currentExIdx) {
        const name = ctrl.get('exerciseName')?.value;
        if (name) usedNames.add(name);
      }
    });

    return exercises
      .filter(e => !usedNames.has(e.name))
      .map(e => ({
        label: `${e.name} (${e.equipment})`,
        value: e.name
      }));
  }

  ngOnInit(): void {
    this.initWeeklyForm();
    if (this.editData) {
      this.populateFormWithEditData(this.editData);
    }
  }

  get weeklyCalendarDays(): FormArray {
    return this.createWeeklyForm.get('calendar') as FormArray;
  }

  getWeeklyExercises(dayIndex: number): FormArray {
    return this.weeklyCalendarDays.at(dayIndex).get('exercises') as FormArray;
  }

  private initWeeklyForm(): void {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    this.createWeeklyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      level: ['Beginner'],
      goal: ['Hypertrophy'],
      calendar: this.fb.array(
        weekdays.map(day => this.createWeeklyDayGroup(day))
      )
    });
  }

  private populateFormWithEditData(data: any): void {
    this.createWeeklyForm.patchValue({
      name: data.name,
      description: data.description,
      level: data.level,
      goal: data.goal
    });

    const calendarArray = this.weeklyCalendarDays;
    calendarArray.clear();

    data.calendar.forEach((day: any) => {
      const categories = day.targetCategory ? day.targetCategory.split(' + ') : ['Back'];

      const dayGroup = this.fb.group({
        dayName: [day.dayName],
        type: [day.type || 'workout', [Validators.required]],
        targetCategories: [categories],
        splitDayName: [day.splitDayName || day.dayName],
        exercises: this.fb.array(
          (day.exercises || []).map((ex: any) => this.fb.group({
            exerciseName: [ex.name || '', [Validators.required]],
            targetSets: [ex.sets || 3, [Validators.required, Validators.min(1)]],
            targetReps: [ex.reps || '10-12 reps', [Validators.required]],
            notes: [ex.notes || '']
          }))
        )
      });

      // Monitor type changes for the edited day as well
      dayGroup.get('type')?.valueChanges.subscribe(val => {
        const exercisesArray = dayGroup.get('exercises') as FormArray;
        if (val === 'rest') {
          while (exercisesArray.length > 0) exercisesArray.removeAt(0);
        } else {
          if (exercisesArray.length === 0) {
            const cats = dayGroup.get('targetCategories')?.value || ['Back'];
            const av = this.getExercisesForCategories(cats);
            exercisesArray.push(this.fb.group({
              exerciseName: [av[0]?.name || '', [Validators.required]],
              targetSets: [3, [Validators.required, Validators.min(1)]],
              targetReps: ['10-12 reps', [Validators.required]],
              notes: ['']
            }));
          }
        }
      });

      calendarArray.push(dayGroup);
    });
  }

  private createWeeklyDayGroup(dayName: string): FormGroup {
    const defaultCat = 'Back';
    const available = this.getExercisesForCategory(defaultCat);

    const dayGroup = this.fb.group({
      dayName: [dayName],
      type: ['workout', [Validators.required]], // 'workout' | 'rest'
      targetCategories: [[defaultCat]], // Changed to support multiple target categories
      splitDayName: [`${dayName}`],
      exercises: this.fb.array([
        this.fb.group({
          exerciseName: ['', [Validators.required]],
          targetSets: [3, [Validators.required, Validators.min(1)]],
          targetReps: ['10-12 reps', [Validators.required]],
          notes: ['']
        })
      ])
    });

    // Monitor type ('workout' vs 'rest') to toggle controls or reset exercises
    dayGroup.get('type')?.valueChanges.subscribe(val => {
      const exercisesArray = dayGroup.get('exercises') as FormArray;
      if (val === 'rest') {
        while (exercisesArray.length > 0) exercisesArray.removeAt(0);
      } else {
        if (exercisesArray.length === 0) {
          const categories = dayGroup.get('targetCategories')?.value || ['Back'];
          const av = this.getExercisesForCategories(categories);
          exercisesArray.push(this.fb.group({
            exerciseName: ['', [Validators.required]],
            targetSets: [3, [Validators.required, Validators.min(1)]],
            targetReps: ['10-12 reps', [Validators.required]],
            notes: ['']
          }));
        }
      }
    });

    return dayGroup;
  }

  addWeeklyExercise(dayIndex: number): void {
    const day = this.weeklyCalendarDays.at(dayIndex);
    const categories = day.get('targetCategories')?.value || ['Back'];
    const available = this.getExercisesForCategories(categories);

    // Pick first exercise not already used in this day
    const usedNames = new Set<string>();
    this.getWeeklyExercises(dayIndex).controls.forEach(ctrl => {
      const name = ctrl.get('exerciseName')?.value;
      if (name) usedNames.add(name);
    });
    const nextExercise = available.find(e => !usedNames.has(e.name));

    const exGroup = this.fb.group({
      exerciseName: ['', [Validators.required]],
      targetSets: [3, [Validators.required, Validators.min(1)]],
      targetReps: ['10-12 reps', [Validators.required]],
      notes: ['']
    });

    this.getWeeklyExercises(dayIndex).push(exGroup);
  }

  removeWeeklyExercise(dayIndex: number, exIndex: number): void {
    const exArray = this.getWeeklyExercises(dayIndex);
    if (exArray.length > 1) {
      exArray.removeAt(exIndex);
    }
  }

  copyWorkout(dayIndex: number): void {
    const dayGroup = this.weeklyCalendarDays.at(dayIndex);
    const exercisesArray = dayGroup.get('exercises') as FormArray;
    
    this.copiedWorkout = {
      targetCategories: [...(dayGroup.get('targetCategories')?.value || [])],
      splitDayName: dayGroup.get('splitDayName')?.value || '',
      exercises: exercisesArray.value.map((ex: any) => ({ ...ex }))
    };
    
    this.notification.success(`Workout plan from ${dayGroup.get('dayName')?.value} copied!`);
  }

  pasteWorkout(dayIndex: number): void {
    if (!this.copiedWorkout) return;

    const dayGroup = this.weeklyCalendarDays.at(dayIndex);
    dayGroup.get('type')?.setValue('workout');
    dayGroup.get('targetCategories')?.setValue([...this.copiedWorkout.targetCategories]);
    dayGroup.get('splitDayName')?.setValue(this.copiedWorkout.splitDayName);

    const exercisesArray = dayGroup.get('exercises') as FormArray;
    exercisesArray.clear();

    this.copiedWorkout.exercises.forEach((ex: any) => {
      exercisesArray.push(this.fb.group({
        exerciseName: [ex.exerciseName, [Validators.required]],
        targetSets: [ex.targetSets, [Validators.required, Validators.min(1)]],
        targetReps: [ex.targetReps, [Validators.required]],
        notes: [ex.notes]
      }));
    });

    this.notification.success(`Workout plan pasted to ${dayGroup.get('dayName')?.value}!`);
  }

  getExercisesForCategory(category: string): Exercise[] {
    if (!category) return [];
    if (this.exercisesMap[category]) {
      return this.exercisesMap[category];
    }
    const key = Object.keys(this.exercisesMap).find(k => k.toLowerCase() === category.toLowerCase());
    return key ? this.exercisesMap[key] : [];
  }

  // Get merged list of exercises for multiple selected categories
  getExercisesForCategories(categories: string[]): Exercise[] {
    if (!categories || categories.length === 0) return [];
    let combined: Exercise[] = [];
    categories.forEach(cat => {
      const list = this.getExercisesForCategory(cat);
      combined = [...combined, ...list];
    });
    // Remove duplicates by name
    return combined.filter((ex, index, self) =>
      self.findIndex(e => e.name === ex.name) === index
    );
  }

  // Toggle category pill/chip selection
  toggleCategory(dayIndex: number, category: string): void {
    const dayGroup = this.weeklyCalendarDays.at(dayIndex);
    const currentCats: string[] = dayGroup.get('targetCategories')?.value || [];
    let newCats: string[];

    if (currentCats.includes(category)) {
      // Don't allow toggling off if it's the last selected category
      if (currentCats.length <= 1) return;
      newCats = currentCats.filter(c => c !== category);
    } else {
      newCats = [...currentCats, category];
    }

    dayGroup.get('targetCategories')?.setValue(newCats);

    // Automatically dynamic update: ensure first exercise is valid if we modify categories
    const exercisesArray = this.getWeeklyExercises(dayIndex);
    if (exercisesArray.length === 1) {
      const currentEx = exercisesArray.at(0).get('exerciseName')?.value;
      const av = this.getExercisesForCategories(newCats);
      const isStillValid = av.some(e => e.name === currentEx);
      if (!isStillValid && av.length > 0) {
        exercisesArray.at(0).get('exerciseName')?.setValue(av[0].name);
      }
    }
  }

  isCategorySelected(dayIndex: number, category: string): boolean {
    const dayGroup = this.weeklyCalendarDays.at(dayIndex);
    const currentCats: string[] = dayGroup.get('targetCategories')?.value || [];
    return currentCats.includes(category);
  }

  // Wizard Step Navigation
  nextStep(): void {
    this.createWeeklyForm.get('name')?.markAsTouched();

    if (this.createWeeklyForm.get('name')?.valid) {
      this.activeStep = 'plan';
    }
  }

  prevStep(): void {
    this.activeStep = 'details';
  }

  onSubmitWeekly(): void {
    // 1. Check if name is invalid (Step 1 Basic Info)
    if (this.createWeeklyForm.get('name')?.invalid) {
      this.createWeeklyForm.get('name')?.markAsTouched();
      this.activeStep = 'details';
      return;
    }

    // 2. Identify days with pending/unconfigured workouts
    const valBefore = this.createWeeklyForm.getRawValue();
    const pendingDays: string[] = [];

    valBefore.calendar.forEach((c: any) => {
      if (c.type === 'workout') {
        const hasEmptyExercise = !c.exercises || c.exercises.length === 0 || c.exercises.some((e: any) => !e.exerciseName);
        if (hasEmptyExercise) {
          pendingDays.push(c.dayName);
        }
      }
    });

    if (pendingDays.length > 0) {
      this.confirmMessage = `You have pending (unconfigured) workouts on the following days: ${pendingDays.join(', ')}. Are you sure you want to save?`;
      this.showConfirmPopup = true;
      return;
    }

    this.proceedWithSave();
  }

  onConfirmSave(): void {
    this.showConfirmPopup = false;

    // Temporarily clear validators on empty exercise fields so Angular marks the form as valid
    this.weeklyCalendarDays.controls.forEach((dayCtrl: any) => {
      const exercisesArray = dayCtrl.get('exercises') as FormArray;
      if (exercisesArray) {
        exercisesArray.controls.forEach((exCtrl: any) => {
          if (!exCtrl.get('exerciseName')?.value) {
            exCtrl.get('exerciseName')?.clearValidators();
            exCtrl.get('exerciseName')?.updateValueAndValidity();
          }
        });
      }
    });

    this.proceedWithSave();
  }

  onCancelSave(): void {
    this.showConfirmPopup = false;
    this.createWeeklyForm.markAllAsTouched();
  }

  proceedWithSave(): void {
    // Check for standard form validation errors
    if (this.createWeeklyForm.invalid) {
      this.createWeeklyForm.markAllAsTouched();
      return;
    }

    const val = this.createWeeklyForm.getRawValue();
    const activeDays = val.calendar.filter((c: any) => c.type === 'workout').length;

    const weeklyData = {
      ...(this.editData ? { id: this.editData.id } : {}),
      name: val.name,
      description: val.description,
      level: val.level,
      goal: val.goal,
      activeDaysCount: activeDays,
      calendar: val.calendar.map((c: any) => {
        if (c.type === 'rest') {
          return {
            dayName: c.dayName,
            type: 'rest',
            exercises: []
          };
        } else {
          return {
            dayName: c.dayName,
            type: 'workout',
            targetCategory: (c.targetCategories || []).join(' + '), // e.g. "Back + Biceps"
            splitDayName: c.splitDayName || `${c.dayName} Focus`,
            exercises: c.exercises
              .filter((e: any) => e.exerciseName) // Filter out empty unconfigured exercises
              .map((e: any) => ({
                name: e.exerciseName,
                sets: e.targetSets,
                reps: e.targetReps,
                notes: e.notes
              }))
          };
        }
      })
    };

    this.save.emit(weeklyData);
  }

  onClose(): void {
    this.close.emit();
  }
}
