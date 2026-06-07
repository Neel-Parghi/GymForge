import { Component, Input, Output, EventEmitter, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, FormArray } from '@angular/forms';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../../../shared/models/dropdown.model';

@Component({
  selector: 'app-member-detail-track-performance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DropdownComponent],
  templateUrl: './member-detail-track-performance.html',
  styleUrl: './member-detail-track-performance.scss',
})
export class PTMemberDetailTrackPerformanceComponent implements OnInit, OnChanges {
  private notification = inject(NotificationService);

  @Input() todayWorkout: any = null;
  @Input() activeSplit: any = null;
  @Input() loggingDate: Date = new Date();

  @Output() saveSession = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  selectedExerciseIndex = 0;
  daySelectControl = new FormControl('');
  newExerciseControl = new FormControl('');
  dropdownOptions: DropdownOption[] = [];
  workoutForm!: FormGroup;

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

  // Custom Modal for Add Exercise
  showAddExerciseModal = false;

  ngOnInit(): void {
    if (this.todayWorkout) {
      this.daySelectControl.setValue(this.todayWorkout.dayName, { emitEvent: false });
      this.buildWorkoutForm();
    }
    this.setupDropdownOptions();

    this.daySelectControl.valueChanges.subscribe(val => {
      if (val) {
        this.onDaySelect(val);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['todayWorkout'] && this.todayWorkout) {
      this.daySelectControl.setValue(this.todayWorkout.dayName, { emitEvent: false });
      this.buildWorkoutForm();
    }
  }

  buildWorkoutForm() {
    const exerciseGroups = (this.todayWorkout?.exercises || []).map((ex: any) => {
      const setGroups = (ex.sets || []).map((set: any) => {
        const fg = new FormGroup({
          weight: new FormControl(set.weight || 0),
          reps: new FormControl(set.reps || 0),
          completed: new FormControl(set.completed || false)
        });
        fg.valueChanges.subscribe(changes => {
          set.weight = changes.weight ?? 0;
          set.reps = changes.reps ?? 0;
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
      this.todayWorkout.exercises = foundDay.exercises.map((ex: any) => ({
        name: ex.name,
        skipped: false,
        sets: Array.from({ length: typeof ex.sets === 'number' ? ex.sets : 3 }, (_, i) => ({
          setNo: i + 1,
          target: typeof ex.reps === 'string' ? ex.reps : '8-12 reps',
          weight: 20,
          reps: 10,
          completed: false
        }))
      }));
      this.selectedExerciseIndex = 0;
      this.buildWorkoutForm();
      this.notification.info(`Switched workout day to: ${foundDay.dayName}`);
    }
  }

  selectExercise(index: number): void {
    this.selectedExerciseIndex = index;
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
      weight: lastSet?.weight || 20,
      reps: lastSet?.reps || 10,
      completed: false
    };
    exercise.sets.push(newSetObj);

    const setsArray = this.getSetsFormArray(exerciseIndex);
    const fg = new FormGroup({
      weight: new FormControl(newSetObj.weight),
      reps: new FormControl(newSetObj.reps),
      completed: new FormControl(newSetObj.completed)
    });
    fg.valueChanges.subscribe(changes => {
      newSetObj.weight = changes.weight ?? 20;
      newSetObj.reps = changes.reps ?? 10;
      newSetObj.completed = !!changes.completed;
    });
    setsArray.push(fg);

    this.notification.success('Added new set.');

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
      this.notification.warning('An exercise must have at least one set.');
      return;
    }
    exercise.sets.splice(setIndex, 1);
    exercise.sets.forEach((s: any, idx: number) => {
      s.setNo = idx + 1;
    });

    const setsArray = this.getSetsFormArray(exerciseIndex);
    setsArray.removeAt(setIndex);

    this.notification.info('Set removed.');
  }

  toggleExerciseSkipped(exercise: any): void {
    exercise.skipped = !exercise.skipped;
    if (exercise.skipped) {
      this.notification.info(`${exercise.name} marked as skipped.`);
    } else {
      this.notification.info(`${exercise.name} marked as active.`);
    }
  }

  openAddExerciseModal(): void {
    this.newExerciseControl.setValue('');
    this.showAddExerciseModal = true;
  }

  closeAddExerciseModal(): void {
    this.showAddExerciseModal = false;
  }

  confirmAddExercise(): void {
    const exName = this.newExerciseControl.value?.trim();
    if (!exName) {
      this.notification.warning('Please enter a valid exercise name.');
      return;
    }

    if (!this.todayWorkout.exercises) {
      this.todayWorkout.exercises = [];
    }

    const newExObj = {
      name: exName,
      skipped: false,
      sets: [
        { setNo: 1, target: '8-12 reps', weight: 20, reps: 10, completed: false }
      ]
    };
    this.todayWorkout.exercises.push(newExObj);

    const exArray = this.exercisesFormArray;
    const setGroups = newExObj.sets.map((set: any) => {
      const fg = new FormGroup({
        weight: new FormControl(set.weight),
        reps: new FormControl(set.reps),
        completed: new FormControl(set.completed)
      });
      fg.valueChanges.subscribe(changes => {
        set.weight = changes.weight ?? 20;
        set.reps = changes.reps ?? 10;
        set.completed = !!changes.completed;
      });
      return fg;
    });
    exArray.push(new FormGroup({
      sets: new FormArray(setGroups)
    }));

    this.selectedExerciseIndex = this.todayWorkout.exercises.length - 1;
    this.closeAddExerciseModal();
    this.notification.success(`Added ${exName} to today's workout tracker!`);
  }

  onSaveSession(): void {
    this.saveSession.emit();
  }
}
