import { Component, Input, Output, EventEmitter, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../../../shared/models/dropdown.model';
import { CONSTANTS } from '../../../../../core/constants/constants';
import { WorkoutMasterService } from '../../../../../core/services/workout-master.service';

@Component({
  selector: 'app-member-detail-track-performance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DropdownComponent],
  templateUrl: './member-detail-track-performance.component.html',
  styleUrl: './member-detail-track-performance.component.scss',
})
export class PTMemberDetailTrackPerformanceComponent implements OnInit, OnChanges {
  private notification = inject(NotificationService);
  private workoutMasterService = inject(WorkoutMasterService);

  @Input() todayWorkout: any = null;
  @Input() activeSplit: any = null;
  @Input() loggingDate: Date = new Date();

  @Output() saveSession = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  selectedExerciseIndex = 0;

  mobileStage: 'days' | 'exercises' | 'set-logger' = 'exercises';
  initialDayName: string | null = null;

  daySelectControl = new FormControl('');
  newExerciseControl = new FormControl('');
  dropdownOptions: DropdownOption[] = [];
  workoutForm!: FormGroup;

  isCardioExercise(name: string, target?: string): boolean {
    if (!name) return false;
    const nameLower = name.toLowerCase().trim();

    if (CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.CARDIO_KEYWORDS.some(keyword => nameLower.includes(keyword))) {
      return true;
    }

    if (CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.CARDIO_NAME_REGEXP.test(nameLower)) {
      if (nameLower.includes('farmer')) {
        return false;
      }
      return true;
    }

    if (target) {
      const targetLower = target.toLowerCase().trim();
      if (CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.CARDIO_TARGET_REGEXP.test(targetLower)) {
        return true;
      }
    }

    return false;
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get isBackdating(): boolean {
    if (!this.loggingDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const logD = new Date(this.loggingDate);
    logD.setHours(0, 0, 0, 0);
    return logD.getTime() !== today.getTime();
  }

  showAddExerciseModal = false;
  showSwapExerciseModal = false;
  swapExerciseControl = new FormControl('');
  swapExerciseIndex: number | null = null;
  addExerciseUseCustomName = false;
  swapExerciseUseCustomName = false;
  exerciseCatalogOptions: DropdownOption[] = [];

  private getPlainDayName(dayName: string): string {
    return dayName ? dayName.split(' - ')[0] : dayName;
  }

  ngOnInit(): void {
    if (this.todayWorkout) {
      this.daySelectControl.setValue(this.getPlainDayName(this.todayWorkout.dayName), { emitEvent: false });
      this.buildWorkoutForm();
      if (this.initialDayName === null) {
        this.initialDayName = this.getPlainDayName(this.todayWorkout.dayName);
      }
    }
    this.setupDropdownOptions();
    this.loadExerciseCatalog();

    this.daySelectControl.valueChanges.subscribe(val => {
      if (val) {
        this.onDaySelect(val);
      }
    });
  }

  loadExerciseCatalog(): void {
    this.workoutMasterService.getExercises().subscribe({
      next: (exercises) => {
        this.exerciseCatalogOptions = (exercises || []).map(e => ({
          label: `${e.name} (${e.category})`,
          value: e.name
        }));
      },
      error: () => {
        this.exerciseCatalogOptions = [];
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['todayWorkout'] && this.todayWorkout) {
      this.daySelectControl.setValue(this.getPlainDayName(this.todayWorkout.dayName), { emitEvent: false });
      this.buildWorkoutForm();
      if (this.initialDayName === null) {
        this.initialDayName = this.getPlainDayName(this.todayWorkout.dayName);
      }
      if (changes['todayWorkout'].isFirstChange()) {
        this.mobileStage = 'exercises';
      }
    }
    if (changes['activeSplit'] && this.activeSplit) {
      this.setupDropdownOptions();
    }
  }

  buildWorkoutForm() {
    const exerciseGroups = (this.todayWorkout?.exercises || []).map((ex: any) => {
      if (ex.isCardio === undefined) {
        ex.isCardio = this.isCardioExercise(ex.name, ex.sets[0]?.target);
      }
      const setGroups = (ex.sets || []).map((set: any) => {
        const fg = new FormGroup({
          weight: new FormControl(set.weight || null, [Validators.min(0), Validators.max(300)]),
          reps: new FormControl(set.reps || null, [Validators.min(0), Validators.max(100)]),
          completed: new FormControl(set.completed || false)
        });
        fg.valueChanges.subscribe(changes => {
          let newWeight = changes.weight ?? 0;
          let newReps = changes.reps ?? 0;
          let updated = false;

          if (newWeight > 300) { newWeight = 300; updated = true; }
          if (newWeight < 0) { newWeight = 0; updated = true; }
          if (newReps > 100) { newReps = 100; updated = true; }
          if (newReps < 0) { newReps = 0; updated = true; }

          if (updated) {
            fg.patchValue({ weight: newWeight, reps: newReps }, { emitEvent: false });
          }

          set.weight = newWeight;
          set.reps = newReps;
          set.completed = !!changes.completed;
        });
        return fg;
      });
      return new FormGroup({
        sets: new FormArray(setGroups)
      });
    });
    this.workoutForm = new FormGroup({
      exercises: new FormArray(exerciseGroups)
    });
  }

  get exercisesFormArray(): FormArray {
    return this.workoutForm.get('exercises') as FormArray;
  }

  getSetsFormArray(exerciseIndex: number): FormArray {
    const exGroup = this.exercisesFormArray.at(exerciseIndex) as FormGroup;
    return exGroup.get('sets') as FormArray;
  }

  getSetFormGroup(exerciseIndex: number, setIndex: number): FormGroup {
    return this.getSetsFormArray(exerciseIndex).at(setIndex) as FormGroup;
  }

  setupDropdownOptions(): void {
    if (this.activeSplit && this.activeSplit.days) {
      this.dropdownOptions = this.activeSplit.days.map((d: any) => {
        const labelText = d.category ? `${d.dayName} - ${d.category}` : d.dayName;
        return {
          label: labelText || 'Workout Day',
          value: d.dayName || 'Workout Day',
          icon: 'fa-solid fa-calendar-day'
        };
      });
    } else {
      this.dropdownOptions = [];
    }
  }

  onDaySelect(dayName: string): void {
    const foundDay = this.activeSplit?.days.find((d: any) => d.dayName === dayName);
    if (foundDay) {
      this.todayWorkout.dayName = foundDay.dayName;
      this.todayWorkout.exercises = foundDay.exercises.map((ex: any) => {
        const isCardio = this.isCardioExercise(ex.name, ex.reps);
        return {
          name: ex.name,
          skipped: false,
          isCardio: isCardio,
          sets: Array.from({ length: typeof ex.sets === 'number' ? ex.sets : 3 }, (_, i) => ({
            setNo: i + 1,
            target: typeof ex.reps === 'string' ? ex.reps : '8-12 reps',
            weight: "",
            reps: 10,
            completed: false
          }))
        };
      });
      this.selectedExerciseIndex = 0;
      this.buildWorkoutForm();
      this.notification.info(CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.SWITCH_WORKOUT_DAY_PREFIX + foundDay.dayName);
    }
  }

  selectExercise(index: number): void {
    this.selectedExerciseIndex = index;
    this.mobileStage = 'set-logger';
  }

  selectMobileDay(day: any): void {
    if (day?.dayName) {
      this.onDaySelect(day.dayName);
    }
    this.mobileStage = 'exercises';
  }

  backToDays(): void {
    this.mobileStage = 'days';
  }

  backToExercises(): void {
    this.mobileStage = 'exercises';
  }

  getCompletedSetsCount(exercise: any): number {
    if (!exercise || !exercise.sets) return 0;
    return exercise.sets.filter((s: any) => s.completed).length;
  }

  toggleSetCompletion(set: any, exerciseIndex: number, setIndex: number): void {
    const fg = this.getSetFormGroup(exerciseIndex, setIndex);
    fg.get('completed')?.setValue(!fg.get('completed')?.value);
  }

  addSetToExercise(exercise: any, exerciseIndex: number): void {
    const nextSetNo = exercise.sets.length + 1;
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSetObj = {
      setNo: nextSetNo,
      target: lastSet?.target || '8-12 reps',
      weight: lastSet?.weight || "",
      reps: lastSet?.reps || 10,
      completed: false
    };
    exercise.sets.push(newSetObj);

    const setsArray = this.getSetsFormArray(exerciseIndex);
    const fg = new FormGroup({
      weight: new FormControl(newSetObj.weight, [Validators.min(0), Validators.max(300)]),
      reps: new FormControl(newSetObj.reps, [Validators.min(0), Validators.max(100)]),
      completed: new FormControl(newSetObj.completed)
    });
    fg.valueChanges.subscribe(changes => {
      let newWeight = changes.weight ?? 20;
      let newReps = changes.reps ?? 10;
      let updated = false;

      if (newWeight > 300) { newWeight = 300; updated = true; }
      if (newWeight < 0) { newWeight = 0; updated = true; }
      if (newReps > 100) { newReps = 100; updated = true; }
      if (newReps < 0) { newReps = 0; updated = true; }

      if (updated) {
        fg.patchValue({ weight: newWeight, reps: newReps }, { emitEvent: false });
      }

      newSetObj.weight = newWeight;
      newSetObj.reps = newReps;
      newSetObj.completed = !!changes.completed;
    });
    setsArray.push(fg);

    this.notification.success(CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.ADDED_NEW_SET);

    setTimeout(() => {
      const rows = document.querySelectorAll('.table-row-item');
      if (rows.length > 0) {
        const lastRow = rows[rows.length - 1];
        lastRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const weightInput = lastRow.querySelector('input[type="number"]') as HTMLInputElement;
        if (weightInput) {
          weightInput.focus();
          weightInput.select();
        }
      }
    }, 50);
  }

  deleteSet(exercise: any, exerciseIndex: number, setIndex: number): void {
    if (exercise.sets.length <= 1) {
      this.notification.warning(CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.MIN_SET_WARNING);
      return;
    }
    exercise.sets.splice(setIndex, 1);
    exercise.sets.forEach((s: any, idx: number) => {
      s.setNo = idx + 1;
    });

    const setsArray = this.getSetsFormArray(exerciseIndex);
    setsArray.removeAt(setIndex);

    this.notification.info(CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.SET_REMOVED);
  }

  toggleExerciseSkipped(exercise: any): void {
    exercise.skipped = !exercise.skipped;
    if (exercise.skipped) {
      this.notification.info(exercise.name + CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.MARKED_SKIPPED_SUFFIX);
    } else {
      this.notification.info(exercise.name + CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.MARKED_ACTIVE_SUFFIX);
    }
  }

  openAddExerciseModal(): void {
    this.newExerciseControl.setValue('');
    this.addExerciseUseCustomName = false;
    this.showAddExerciseModal = true;
  }

  closeAddExerciseModal(): void {
    this.showAddExerciseModal = false;
  }

  toggleAddExerciseCustomName(): void {
    this.addExerciseUseCustomName = !this.addExerciseUseCustomName;
  }

  confirmAddExercise(): void {
    const exName = this.newExerciseControl.value?.trim();
    if (!exName) {
      this.notification.warning(CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.INVALID_EXERCISE_NAME);
      return;
    }

    if (!this.todayWorkout.exercises) {
      this.todayWorkout.exercises = [];
    }

    const isCardio = this.isCardioExercise(exName);
    const newExObj = {
      name: exName,
      skipped: false,
      isCardio: isCardio,
      sets: [
        { setNo: 1, target: isCardio ? '20 mins' : '8-12 reps', weight: '', reps: isCardio ? 20 : 10, completed: false }
      ]
    };
    this.todayWorkout.exercises.push(newExObj);

    const exArray = this.exercisesFormArray;
    const setGroups = newExObj.sets.map((set: any) => {
      const fg = new FormGroup({
        weight: new FormControl(set.weight, [Validators.min(0), Validators.max(300)]),
        reps: new FormControl(set.reps, [Validators.min(0), Validators.max(100)]),
        completed: new FormControl(set.completed)
      });
      fg.valueChanges.subscribe(changes => {
        let newWeight = changes.weight ?? 20;
        let newReps = changes.reps ?? 10;
        let updated = false;

        if (newWeight > 300) { newWeight = 300; updated = true; }
        if (newWeight < 0) { newWeight = 0; updated = true; }
        if (newReps > 100) { newReps = 100; updated = true; }
        if (newReps < 0) { newReps = 0; updated = true; }

        if (updated) {
          fg.patchValue({ weight: newWeight, reps: newReps }, { emitEvent: false });
        }

        set.weight = newWeight;
        set.reps = newReps;
        set.completed = !!changes.completed;
      });
      return fg;
    });
    exArray.push(new FormGroup({
      sets: new FormArray(setGroups)
    }));

    this.selectedExerciseIndex = this.todayWorkout.exercises.length - 1;
    this.closeAddExerciseModal();
    this.notification.success(CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.ADDED_EXERCISE_PREFIX + exName + CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.ADDED_EXERCISE_SUFFIX);
  }

  openSwapExerciseModal(index: number): void {
    this.swapExerciseIndex = index;
    this.swapExerciseControl.setValue('');
    this.swapExerciseUseCustomName = false;
    this.showSwapExerciseModal = true;
  }

  closeSwapExerciseModal(): void {
    this.showSwapExerciseModal = false;
    this.swapExerciseIndex = null;
  }

  toggleSwapExerciseCustomName(): void {
    this.swapExerciseUseCustomName = !this.swapExerciseUseCustomName;
  }

  confirmSwapExercise(): void {
    const newName = this.swapExerciseControl.value?.trim();
    if (!newName) {
      this.notification.warning(CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.INVALID_SWAP_EXERCISE_NAME);
      return;
    }

    const index = this.swapExerciseIndex;
    if (index === null || !this.todayWorkout?.exercises?.[index]) {
      this.closeSwapExerciseModal();
      return;
    }

    const exercise = this.todayWorkout.exercises[index];
    const oldName = exercise.name;
    const wasCardio = exercise.isCardio;
    const isCardio = this.isCardioExercise(newName);

    exercise.name = newName;
    exercise.isCardio = isCardio;
    exercise.skipped = false;
    exercise.sets = exercise.sets.map((s: any) => ({
      setNo: s.setNo,
      target: isCardio !== wasCardio ? (isCardio ? '20 mins' : '8-12 reps') : s.target,
      weight: '',
      reps: isCardio ? 20 : 10,
      completed: false
    }));

    this.buildWorkoutForm();
    this.selectedExerciseIndex = index;
    this.closeSwapExerciseModal();
    this.notification.success(
      CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.SWAPPED_EXERCISE_PREFIX + oldName +
      CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.SWAPPED_EXERCISE_MID + newName +
      CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.SWAPPED_EXERCISE_SUFFIX
    );
  }

  toggleExerciseMode(exercise: any): void {
    exercise.isCardio = !exercise.isCardio;
    this.notification.info(CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.SWITCHED_MODE_PREFIX + exercise.name + CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.SWITCHED_MODE_MID + (exercise.isCardio ? 'Cardio' : 'Strength') + CONSTANTS.MEMBER_DETAIL_MODULE.TRACK_PERFORMANCE.SWITCHED_MODE_SUFFIX);
  }

  onSaveSession(): void {
    this.saveSession.emit();
  }
}
