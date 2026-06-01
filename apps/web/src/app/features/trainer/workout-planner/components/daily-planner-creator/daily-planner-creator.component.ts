import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Exercise } from '../../../../../shared/models/exercise.model';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../../../shared/models/dropdown.model';
import { NotificationService } from '../../../../../core/services/notification.service';

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
  @Input() editData: any = null;

  @Output() save = new EventEmitter<any>();
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

  getExercisesDropdownOptions(currentExIdx?: number): DropdownOption[] {
    const selectedCats = this.createDailyForm.get('targetCategories')?.value || ['Back'];
    const exercises = this.getExercisesForCategories(selectedCats);

    const usedNames = new Set<string>();
    this.dailyExercises.controls.forEach((ctrl, idx) => {
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
      targetCategories: categories
    });

    const exArray = this.dailyExercises;
    exArray.clear();

    (data.exercises || []).forEach((ex: any) => {
      exArray.push(this.fb.group({
        exerciseName: [ex.name || '', [Validators.required]],
        targetSets: [ex.sets || 3, [Validators.required, Validators.min(1)]],
        targetReps: [ex.reps || '10-12 reps', [Validators.required]],
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
      targetSets: [3, [Validators.required, Validators.min(1)]],
      targetReps: ['10-12 reps', [Validators.required]],
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
        this.notification.warning('At least one target muscle category must be selected.');
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
  }

  removeDailyExercise(index: number): void {
    if (this.dailyExercises.length > 1) {
      this.dailyExercises.removeAt(index);
    } else {
      this.notification.warning('Workout split must have at least one exercise.');
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
    this.notification.success('Workout copied to clipboard!');
  }

  pasteWorkout(): void {
    const raw = localStorage.getItem('gymforge_copied_workout_split');
    if (!raw) {
      this.notification.warning('No copied workout split found on clipboard.');
      return;
    }

    try {
      const data = JSON.parse(raw);
      if (!data.exercises || data.exercises.length === 0) return;

      this.createDailyForm.patchValue({
        targetCategories: data.categories || ['Back']
      });

      const exArray = this.dailyExercises;
      exArray.clear();

      data.exercises.forEach((ex: any) => {
        exArray.push(this.fb.group({
          exerciseName: [ex.name || '', [Validators.required]],
          targetSets: [ex.sets || 3, [Validators.required, Validators.min(1)]],
          targetReps: [ex.reps || '10-12 reps', [Validators.required]],
          notes: [ex.notes || '']
        }));
      });

      this.notification.success('Workout split pasted successfully!');
    } catch (e) {
      console.error(e);
      this.notification.error('Error pasting workout.');
    }
  }

  nextStep(): void {
    if (this.createDailyForm.get('name')?.invalid) {
      this.createDailyForm.get('name')?.markAsTouched();
      this.notification.warning('Please enter a valid workout planner name (min 3 characters).');
      return;
    }
    this.activeStep = 'plan';
  }

  prevStep(): void {
    this.activeStep = 'details';
  }

  onSubmitDaily(): void {
    if (this.createDailyForm.invalid) {
      this.notification.error('Form is invalid. Please check all fields.');
      return;
    }

    const name = this.createDailyForm.value.name;
    const description = this.createDailyForm.value.description;
    const level = this.createDailyForm.value.level;
    const goal = this.createDailyForm.value.goal;
    const categories = this.createDailyForm.value.targetCategories || [];
    const targetCategory = categories.join(' + ');

    const exercises = this.dailyExercises.value.map((ex: any) => ({
      name: ex.exerciseName,
      sets: ex.targetSets,
      reps: ex.targetReps,
      notes: ex.notes
    }));

    const result = {
      id: this.editData?.id,
      name,
      description,
      level,
      goal,
      targetCategory,
      exercises
    };

    this.save.emit(result);
  }

  onClose(): void {
    this.close.emit();
  }
}
