import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Exercise } from '../../../../../shared/models/exercise.model';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../../../shared/models/dropdown.model';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ConfirmationPopupComponent } from '../../../../../shared/components/confirmation-popup/confirmation-popup.component';
import { WeeklyPlanner } from '../../../../../shared/models/workout-plan.model';
import { CONSTANTS } from '../../../../../core/constants/constants';

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
  @Input() editData: WeeklyPlanner | null = null;

  @Output() save = new EventEmitter<WeeklyPlanner>();
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

  getCategoryForExercise(exerciseName: string): string | null {
    if (!exerciseName) return null;
    for (const cat of Object.keys(this.exercisesMap)) {
      const found = this.exercisesMap[cat].some(e => e.name === exerciseName);
      if (found) return cat;
    }
    return null;
  }

  getExercisesDropdownOptions(dayIdx: number, currentExIdx?: number): DropdownOption[] {
    const dayGroup = this.weeklyCalendarDays.at(dayIdx);
    const categories = dayGroup.get('targetCategories')?.value || ['Back'];
    const exercises = this.getExercisesForCategories(categories);

    const usedNames = new Set<string>();
    const exArray = this.getWeeklyExercises(dayIdx);
    let currentSelectedName = '';
    if (currentExIdx !== undefined) {
      const currentCtrl = exArray.at(currentExIdx);
      currentSelectedName = currentCtrl?.get('exerciseName')?.value || '';
    }

    exArray.controls.forEach((ctrl, idx) => {
      if (idx !== currentExIdx) {
        const name = ctrl.get('exerciseName')?.value;
        if (name) usedNames.add(name);
      }
    });

    const options = exercises
      .filter(e => !usedNames.has(e.name))
      .map(e => ({
        label: `${e.name} (${e.equipment})`,
        value: e.name
      }));

    if (currentSelectedName && !options.some(opt => opt.value === currentSelectedName)) {
      let exerciseDetail: Exercise | undefined;
      for (const cat of Object.keys(this.exercisesMap)) {
        const found = this.exercisesMap[cat].find(e => e.name === currentSelectedName);
        if (found) {
          exerciseDetail = found;
          break;
        }
      }
      options.unshift({
        label: exerciseDetail ? `${exerciseDetail.name} (${exerciseDetail.equipment})` : currentSelectedName,
        value: currentSelectedName
      });
    }

    return options;
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
      isCustom: [false],
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
      goal: data.goal,
      isCustom: data.isCustom ?? false
    });

    const calendarArray = this.weeklyCalendarDays;
    calendarArray.clear();

    (data.calendar || []).forEach((day: any) => {
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
              targetSets: [4, [Validators.required, Validators.min(1)]],
              targetReps: ['10-12', [Validators.required]],
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
      type: ['workout', [Validators.required]],
      targetCategories: [[defaultCat]],
      splitDayName: [`${dayName}`],
      exercises: this.fb.array([
        this.fb.group({
          exerciseName: ['', [Validators.required]],
          targetSets: [4, [Validators.required, Validators.min(1)]],
          targetReps: ['10-12', [Validators.required]],
          notes: ['']
        })
      ])
    });

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
            targetSets: [4, [Validators.required, Validators.min(1)]],
            targetReps: ['10-12', [Validators.required]],
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

    const usedNames = new Set<string>();
    this.getWeeklyExercises(dayIndex).controls.forEach(ctrl => {
      const name = ctrl.get('exerciseName')?.value;
      if (name) usedNames.add(name);
    });

    const exGroup = this.fb.group({
      exerciseName: ['', [Validators.required]],
      targetSets: [4, [Validators.required, Validators.min(1)]],
      targetReps: ['10-12', [Validators.required]],
      notes: ['']
    });

    this.getWeeklyExercises(dayIndex).push(exGroup);
    setTimeout(() => {
      const wrapper = document.querySelector('.exercise-table-scroll-wrapper');
      if (wrapper) {
        wrapper.scrollTop = wrapper.scrollHeight;
      }
    }, 200);
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
    this.notification.success(CONSTANTS.WORKOUT_PLANNER_MODULE.WEEKLY_COPY_SUCCESS.replace('{day}', dayGroup.get('dayName')?.value));
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

    this.notification.success(CONSTANTS.WORKOUT_PLANNER_MODULE.WEEKLY_PASTE_SUCCESS.replace('{day}', dayGroup.get('dayName')?.value));

    // Clear clipboard so paste button disappears — user must copy again to re-enable
    this.copiedWorkout = null;
  }

  getExercisesForCategory(category: string): Exercise[] {
    if (!category) return [];
    if (this.exercisesMap[category]) {
      return this.exercisesMap[category];
    }
    const key = Object.keys(this.exercisesMap).find(k => k.toLowerCase() === category.toLowerCase());
    return key ? this.exercisesMap[key] : [];
  }

  getExercisesForCategories(categories: string[]): Exercise[] {
    if (!categories || categories.length === 0) return [];
    let combined: Exercise[] = [];
    categories.forEach(cat => {
      const list = this.getExercisesForCategory(cat);
      combined = [...combined, ...list];
    });
    return combined.filter((ex, index, self) =>
      self.findIndex(e => e.name === ex.name) === index
    );
  }

  toggleCategory(dayIndex: number, category: string): void {
    const dayGroup = this.weeklyCalendarDays.at(dayIndex);
    const currentCats: string[] = dayGroup.get('targetCategories')?.value || [];
    let newCats: string[];

    if (currentCats.includes(category)) {
      if (currentCats.length <= 1) return;
      newCats = currentCats.filter(c => c !== category);
    } else {
      newCats = [...currentCats, category];
    }

    dayGroup.get('targetCategories')?.setValue(newCats);

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
    if (this.createWeeklyForm.get('name')?.invalid) {
      this.createWeeklyForm.get('name')?.markAsTouched();
      this.activeStep = 'details';
      return;
    }

    if (this.createWeeklyForm.invalid) {
      this.proceedWithSave();
      return;
    }

    const valBefore = this.createWeeklyForm.getRawValue();
    const pendingDays: string[] = [];

    valBefore.calendar.forEach((c: any) => {
      if (c.type === 'workout') {
        const hasZeroExercises = !c.exercises || c.exercises.length === 0;
        if (hasZeroExercises) {
          pendingDays.push(c.dayName);
        }
      }
    });

    if (pendingDays.length > 0) {
      this.confirmMessage = CONSTANTS.WORKOUT_PLANNER_MODULE.WEEKLY_PENDING_CONFIRM.replace('{days}', pendingDays.join(', '));
      this.showConfirmPopup = true;
      return;
    }

    this.proceedWithSave();
  }

  onConfirmSave(): void {
    this.showConfirmPopup = false;

    this.weeklyCalendarDays.controls.forEach((dayCtrl) => {
      const exercisesArray = dayCtrl.get('exercises') as FormArray;
      if (exercisesArray) {
        exercisesArray.controls.forEach((exCtrl) => {
          const nameCtrl = exCtrl.get('exerciseName');
          const setsCtrl = exCtrl.get('targetSets');
          const repsCtrl = exCtrl.get('targetReps');
          if (!nameCtrl?.value) {
            nameCtrl?.clearValidators();
            nameCtrl?.updateValueAndValidity({ onlySelf: true });
            setsCtrl?.clearValidators();
            setsCtrl?.updateValueAndValidity({ onlySelf: true });
            repsCtrl?.clearValidators();
            repsCtrl?.updateValueAndValidity({ onlySelf: true });

            (exCtrl as FormGroup).updateValueAndValidity({ onlySelf: true });
          }
        });
        exercisesArray.updateValueAndValidity({ onlySelf: true });
      }
      dayCtrl.updateValueAndValidity({ onlySelf: true });
    });

    this.weeklyCalendarDays.updateValueAndValidity({ onlySelf: true });
    this.createWeeklyForm.updateValueAndValidity();

    this.proceedWithSave();
  }

  onCancelSave(): void {
    this.showConfirmPopup = false;
    this.createWeeklyForm.markAllAsTouched();
  }

  private logFormErrors(form: FormGroup | FormArray, name = 'root'): void {
    Object.keys(form.controls).forEach(key => {
      const control = (form.controls as any)[key];
      if (control.invalid) {
        console.warn(`Control "${name}.${key}" is INVALID. Errors:`, control.errors);
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.logFormErrors(control, `${name}.${key}`);
        }
      }
    });
  }

  proceedWithSave(): void {
    if (this.createWeeklyForm.invalid) {
      this.logFormErrors(this.createWeeklyForm);
      this.createWeeklyForm.markAllAsTouched();
      
      let hasInvalidExercises = false;
      for (let i = 0; i < this.weeklyCalendarDays.length; i++) {
        const day = this.weeklyCalendarDays.at(i);
        if (day.get('type')?.value === 'workout') {
          const exercises = this.getWeeklyExercises(i);
          if (exercises.controls.some(ctrl => ctrl.get('exerciseName')?.invalid)) {
            hasInvalidExercises = true;
            break;
          }
        }
      }

      if (hasInvalidExercises) {
        this.notification.error('Please select an exercise for all rows.');
      } else {
        this.notification.error(CONSTANTS.WORKOUT_PLANNER_MODULE.WEEKLY_INVALID_FORM);
      }
      return;
    }

    const val = this.createWeeklyForm.getRawValue();
    const activeDays = val.calendar.filter((c: any) => c.type === 'workout').length;

    const weeklyData: WeeklyPlanner = {
      ...(this.editData ? { id: this.editData.id } : {}),
      name: val.name,
      description: val.description,
      level: val.level,
      goal: val.goal,
      type: 'Weekly',
      isCustom: val.isCustom ?? false,
      activeDaysCount: activeDays,
      calendar: val.calendar.map((c: any) => {
        if (c.type === 'rest') {
          return {
            dayName: c.dayName,
            type: 'rest',
            exercises: []
          };
        } else {
          // Auto-detect categories based on selected exercises to ensure none are missed
          const categoriesSet = new Set<string>(c.targetCategories || []);
          c.exercises.forEach((ex: any) => {
            if (ex.exerciseName) {
              const cat = this.getCategoryForExercise(ex.exerciseName);
              if (cat) categoriesSet.add(cat);
            }
          });
          return {
            dayName: c.dayName,
            type: 'workout',
            targetCategory: Array.from(categoriesSet).join(' + '),
            splitDayName: c.splitDayName || `${c.dayName} Focus`,
            exercises: c.exercises
              .filter((e: any) => e.exerciseName)
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
