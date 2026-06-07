import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Exercise } from '../../../../../shared/models/exercise.model';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../../../shared/models/dropdown.model';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DailyPlanner } from '../../../../../shared/models/workout-plan.model';
import { CONSTANTS } from '../../../../../core/constants/constants';

@Component({
  selector: 'app-daily-planner-creator',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DropdownComponent],
  templateUrl: './daily-planner-creator.component.html',
  styleUrl: './daily-planner-creator.component.scss'
})
export class DailyPlannerCreatorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);

  copiedWorkout: any = null;
  showConfirmPopup = false;
  confirmMessage = '';

  @Input() categories: string[] = [];
  @Input() exercisesMap: { [category: string]: Exercise[] } = {};
  @Input() editData: DailyPlanner | null = null;

  @Output() save = new EventEmitter<DailyPlanner>();
  @Output() close = new EventEmitter<void>();

  createDailyForm!: FormGroup;
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

  getCategoryForExercise(exerciseName: string): string | null {
    if (!exerciseName) return null;
    for (const cat of Object.keys(this.exercisesMap)) {
      const found = this.exercisesMap[cat].some(e => e.name === exerciseName);
      if (found) return cat;
    }
    return null;
  }

  getExercisesDropdownOptions(currentExIdx?: number): DropdownOption[] {
    const selectedCats = this.createDailyForm.get('targetCategories')?.value || ['Back'];
    const exercises = this.getExercisesForCategories(selectedCats);

    const usedNames = new Set<string>();
    let currentSelectedName = '';
    if (currentExIdx !== undefined) {
      const currentCtrl = this.dailyExercises.at(currentExIdx);
      currentSelectedName = currentCtrl?.get('exerciseName')?.value || '';
    }

    this.dailyExercises.controls.forEach((ctrl, idx) => {
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
    this.initDailyForm();
    if (this.editData) {
      this.populateFormWithEditData(this.editData);
    }
  }

  get dailyExercises(): FormArray {
    return this.createDailyForm.get('exercises') as FormArray;
  }

  private initDailyForm(): void {
    this.createDailyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      level: ['Beginner'],
      goal: ['Hypertrophy'],
      isCustom: [false],
      targetCategories: [['Back']],
      exercises: this.fb.array([
        this.createExerciseGroup()
      ])
    });

  }

  private populateFormWithEditData(data: any): void {
    const categories = data.targetCategory ? data.targetCategory.split(' + ') : ['Back'];

    this.createDailyForm.patchValue({
      name: data.name,
      description: data.description,
      level: data.level,
      goal: data.goal,
      isCustom: data.isCustom ?? false,
      targetCategories: categories
    });

    const exArray = this.dailyExercises;
    exArray.clear();

    (data.exercises || []).forEach((ex: any) => {
      exArray.push(this.fb.group({
        exerciseName: [ex.name || '', [Validators.required]],
        targetSets: [ex.sets || 4, [Validators.required, Validators.min(1)]],
        targetReps: [ex.reps || '10-12', [Validators.required]],
        notes: [ex.notes || '']
      }));
    });

    if (exArray.length === 0) {
      exArray.push(this.createExerciseGroup());
    }
  }

  private createExerciseGroup(): FormGroup {
    return this.fb.group({
      exerciseName: ['', [Validators.required]],
      targetSets: [4, [Validators.required, Validators.min(1)]],
      targetReps: ['10-12', [Validators.required]],
      notes: ['']
    });
  }

  private getExercisesForCategories(categories: string[]): Exercise[] {
    let list: Exercise[] = [];
    categories.forEach(cat => {
      if (this.exercisesMap[cat]) {
        list = [...list, ...this.exercisesMap[cat]];
      }
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  toggleCategory(cat: string): void {
    const ctrl = this.createDailyForm.get('targetCategories');
    if (!ctrl) return;
    const current = [...(ctrl.value || [])];
    const idx = current.indexOf(cat);
    if (idx > -1) {
      if (current.length > 1) {
        current.splice(idx, 1);
      } else {
        this.notification.warning(CONSTANTS.WORKOUT_PLANNER_MODULE.DAILY_MIN_CATEGORY);
        return;
      }
    } else {
      current.push(cat);
    }
    ctrl.setValue(current);
  }

  isCategorySelected(cat: string): boolean {
    const current = this.createDailyForm?.get('targetCategories')?.value || [];
    return current.includes(cat);
  }

  addDailyExercise(): void {
    this.dailyExercises.push(this.createExerciseGroup());
    setTimeout(() => {
      const wrapper = document.querySelector('.exercise-table-scroll-wrapper');
      if (wrapper) {
        wrapper.scrollTop = wrapper.scrollHeight;
      }
    }, 200);
  }

  removeDailyExercise(index: number): void {
    if (this.dailyExercises.length > 1) {
      this.dailyExercises.removeAt(index);
    } else {
      this.notification.warning(CONSTANTS.WORKOUT_PLANNER_MODULE.DAILY_MIN_EXERCISE);
    }
  }

  private resetExercises(): void {
    const exArray = this.dailyExercises;
    while (exArray.length > 0) {
      exArray.removeAt(0);
    }
    exArray.push(this.createExerciseGroup());
  }

  copyWorkout(): void {
    const exercisesData = this.dailyExercises.value.map((ex: any) => ({
      name: ex.exerciseName,
      sets: ex.targetSets,
      reps: ex.targetReps,
      notes: ex.notes
    }));

    const categories = this.createDailyForm.get('targetCategories')?.value || [];

    this.copiedWorkout = {
      categories: [...categories],
      exercises: exercisesData
    };

    localStorage.setItem('gymforge_copied_workout_split', JSON.stringify(this.copiedWorkout));
    this.notification.success(CONSTANTS.WORKOUT_PLANNER_MODULE.DAILY_COPY_SUCCESS);
  }

  pasteWorkout(): void {
    const raw = localStorage.getItem('gymforge_copied_workout_split');
    if (!raw) {
      this.notification.warning(CONSTANTS.WORKOUT_PLANNER_MODULE.DAILY_NO_CLIPBOARD);
      return;
    }

    try {
      const data = JSON.parse(raw);
      if (!data.exercises || data.exercises.length === 0) return;

      let categories = ['Back'];
      if (data.categories) {
        categories = data.categories;
      } else if (data.category) {
        categories = data.category.split(' + ');
      }
      this.createDailyForm.patchValue({
        targetCategories: categories
      });

      const exArray = this.dailyExercises;
      exArray.clear();

      data.exercises.forEach((ex: any) => {
        exArray.push(this.fb.group({
          exerciseName: [ex.name || '', [Validators.required]],
          targetSets: [ex.sets || 4, [Validators.required, Validators.min(1)]],
          targetReps: [ex.reps || '10-12', [Validators.required]],
          notes: [ex.notes || '']
        }));
      });

      this.notification.success(CONSTANTS.WORKOUT_PLANNER_MODULE.DAILY_PASTE_SUCCESS);
    } catch (e) {
      console.error(e);
      this.notification.error(CONSTANTS.WORKOUT_PLANNER_MODULE.DAILY_PASTE_ERROR);
    }
  }

  nextStep(): void {
    if (this.createDailyForm.get('name')?.invalid) {
      this.createDailyForm.get('name')?.markAsTouched();
      this.notification.warning(CONSTANTS.WORKOUT_PLANNER_MODULE.DAILY_INVALID_NAME);
      return;
    }
    this.activeStep = 'plan';
  }

  prevStep(): void {
    this.activeStep = 'details';
  }

  onSubmitDaily(): void {
    if (this.createDailyForm.invalid) {
      this.createDailyForm.markAllAsTouched();
      const hasInvalidExercises = this.dailyExercises.controls.some(ctrl => ctrl.get('exerciseName')?.invalid);
      if (hasInvalidExercises) {
        this.notification.error('Please select an exercise for all rows.');
      } else {
        this.notification.error(CONSTANTS.WORKOUT_PLANNER_MODULE.DAILY_INVALID_FORM);
      }
      return;
    }

    const name = this.createDailyForm.value.name;
    const description = this.createDailyForm.value.description;
    const level = this.createDailyForm.value.level;
    const goal = this.createDailyForm.value.goal;

    const categoriesSet = new Set<string>(this.createDailyForm.value.targetCategories || []);
    this.dailyExercises.value.forEach((ex: any) => {
      if (ex.exerciseName) {
        const cat = this.getCategoryForExercise(ex.exerciseName);
        if (cat) categoriesSet.add(cat);
      } 1
    });
    const categories = Array.from(categoriesSet);
    const targetCategory = categories.join(' + ');

    const exercises = this.dailyExercises.value.map((ex: any) => ({
      name: ex.exerciseName,
      sets: ex.targetSets,
      reps: ex.targetReps,
      notes: ex.notes
    }));

    const result: DailyPlanner = {
      id: this.editData?.id,
      name,
      description,
      level,
      goal,
      type: 'Daily',
      isCustom: this.createDailyForm.value.isCustom ?? false,
      targetCategory,
      exercises
    };

    this.save.emit(result);
  }

  onClose(): void {
    this.close.emit();
  }
}
