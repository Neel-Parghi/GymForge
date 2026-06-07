import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { DropdownOption } from '../../../../../shared/models/dropdown.model';

import { CalendarDay } from '../../../../../shared/models/workout-plan.model';

@Component({
  selector: 'app-member-detail-workout-calendar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DropdownComponent],
  templateUrl: './member-detail-workout-calendar.html',
  styleUrl: './member-detail-workout-calendar.scss',
})
export class PTMemberDetailWorkoutCalendarComponent implements OnInit, OnChanges {
  private notification = inject(NotificationService);

  @Input() workoutHistory: any[] = [];
  @Input() activeSplit: any = null;
  @Input() planAssignments: any[] = [];
  @Input() workoutOverrides: { [dateKey: string]: any } = {};

  @Output() openAssignModal = new EventEmitter<void>();
  @Output() changeTab = new EventEmitter<string>();
  @Output() updateOverrides = new EventEmitter<{ dateKey: string, workout: any, scope?: 'single' | 'recurring' }>();
  @Output() logDateWorkout = new EventEmitter<{ date: Date, routineName: string, templateDayName?: string }>();
  @Output() editWorkout = new EventEmitter<any>();

  currentDate = new Date();
  calendarDays: CalendarDay[] = [];
  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Detail viewing
  selectedSession: any = null;
  showDetailsModal = false;

  // Override options modal
  showOverrideModal = false;
  overrideDateKey = '';
  overrideDateLabel = '';
  overrideOptions: DropdownOption[] = [];
  overrideValueControl = new FormControl('');
  overrideScopeControl = new FormControl<'single' | 'recurring'>('single');

  ngOnInit(): void {
    this.generateCalendar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workoutHistory'] || changes['activeSplit'] || changes['planAssignments'] || changes['workoutOverrides']) {
      this.generateCalendar();
    }
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.generateCalendar();
  }

  getMonthLabel(): string {
    return this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: any[] = [];

    // Padding days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const date = new Date(year, month - 1, dayNum);
      days.push(this.createDayObject(date, false));
    }

    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      days.push(this.createDayObject(date, true));
    }

    // Padding days for next month to complete 6-row grid (42 cells)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      days.push(this.createDayObject(date, false));
    }

    this.calendarDays = days;
  }

  createDayObject(date: Date, isCurrentMonth: boolean): any {
    const dateKey = this.getDateKey(date);
    const dayOfWeek = date.getDay();
    const daysName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdayName = daysName[dayOfWeek];

    const todayStr = this.getDateKey(new Date());
    const isToday = dateKey === todayStr;

    // Calculate simple isPast (ignoring times)
    const comparisonDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const comparisonToday = new Date();
    comparisonToday.setHours(0, 0, 0, 0);
    const isPast = comparisonDate.getTime() < comparisonToday.getTime();

    // 1. Check if logged in history
    const historySession = this.workoutHistory.find(h => {
      const d = new Date(h.date);
      return this.getDateKey(d) === dateKey && h.status === 'Completed';
    });

    // 2. Check if overridden (look at either local overrides OR planned sessions in workoutHistory)
    let override = this.workoutOverrides ? this.workoutOverrides[dateKey] : null;
    if (!override) {
      const plannedSession = this.workoutHistory.find(h => {
        const d = new Date(h.date);
        return this.getDateKey(d) === dateKey && (h.status === 'Planned' || h.status === 'RestDay');
      });
      if (plannedSession) {
        override = {
          dayName: plannedSession.dayName,
          templateDayName: plannedSession.dayName.split(' - ')[0],
          exercises: (plannedSession.loggedExercises || plannedSession.exercises || []).map((ex: any) => ({
            name: ex.name,
            sets: (ex.loggedSets || ex.sets || []).length,
            reps: (ex.loggedSets || ex.sets || [])[0]?.reps?.toString() || '8-12 reps'
          }))
        };
      }
    }

    // 3. Find scheduled routine based on the plan assignment active on this date
    let scheduledWorkout: any = null;
    const targetTime = comparisonDate.getTime();
    const activeAssignment = this.planAssignments
      .filter(a => new Date(a.assignedAt).setHours(0, 0, 0, 0) <= targetTime)
      .slice(-1)[0];

    const planToUse = activeAssignment || (!isPast ? this.activeSplit : null);

    if (planToUse && planToUse.days) {
      // Find template day matching day name (e.g., 'Monday') or day index mapping
      let templateDay = planToUse.days.find((d: any) => {
        if (!d.dayName) return false;
        return d.dayName.toLowerCase().includes(weekdayName.toLowerCase());
      });

      // Fallback: If no day name match (e.g., it is a "Split" plan with abstract names like "Day 1", "Day 2"),
      // map them sequentially to Monday (index 0), Wednesday (index 1), Friday (index 2)
      if (!templateDay && planToUse.days.length > 0) {
        if (weekdayName === 'Monday') {
          templateDay = planToUse.days[0];
        } else if (weekdayName === 'Wednesday' && planToUse.days.length > 1) {
          templateDay = planToUse.days[1];
        } else if (weekdayName === 'Friday' && planToUse.days.length > 2) {
          templateDay = planToUse.days[2];
        }
      }

      if (templateDay) {
        scheduledWorkout = {
          dayName: templateDay.dayName,
          category: templateDay.category,
          exercises: templateDay.exercises,
          isRestDay: templateDay.isRestDay || templateDay.dayName.toLowerCase().includes('rest')
        };
      }
    }

    // Final mapping
    let routineName = 'Rest Day';
    let isRestDay = true;
    let exercisesCount = 0;
    let templateDayName = '';

    if (override) {
      routineName = override.dayName;
      isRestDay = routineName.toLowerCase().includes('rest');
      exercisesCount = override.exercises ? override.exercises.length : 0;
      templateDayName = override.templateDayName || '';
    } else if (scheduledWorkout) {
      routineName = scheduledWorkout.isRestDay ? 'Rest Day' : (scheduledWorkout.category || scheduledWorkout.dayName);
      isRestDay = scheduledWorkout.isRestDay;
      exercisesCount = scheduledWorkout.exercises ? scheduledWorkout.exercises.length : 0;
      templateDayName = scheduledWorkout.dayName;
    }

    return {
      date: new Date(date),
      dateKey,
      dayNum: date.getDate(),
      isCurrentMonth,
      isToday,
      isPast,
      historySession,
      override,
      scheduledWorkout,
      routineName,
      isRestDay,
      exercisesCount,
      templateDayName
    };
  }

  getDateKey(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  openSessionDetails(session: any): void {
    const rawExercises = session.loggedExercises || session.exercises || [];
    const exercises = rawExercises.map((ex: any) => {
      const rawSets = ex.loggedSets || ex.sets || [];
      const sets = [...rawSets].sort((a: any, b: any) => (a.setNo || 0) - (b.setNo || 0));
      return {
        ...ex,
        sets
      };
    });
    this.selectedSession = {
      ...session,
      exercises
    };
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedSession = null;
  }

  openOverrideDialog(dayObj: any): void {
    // Only allow overrides for today or future days
    if (dayObj.isPast && !dayObj.isToday) {
      this.notification.warning('Cannot override workouts in the past.');
      return;
    }

    this.overrideDateKey = dayObj.dateKey;
    this.overrideDateLabel = dayObj.date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    this.overrideScopeControl.setValue('single');

    // Populate dropdown options: Split routine days + Rest Day + Custom Cardio option
    const options: DropdownOption[] = [];
    if (this.activeSplit && this.activeSplit.days) {
      this.activeSplit.days.forEach((d: any) => {
        const labelText = d.category ? `${d.dayName} - ${d.category}` : d.dayName;
        options.push({ label: labelText, value: d.dayName, icon: 'fa-solid fa-dumbbell' });
      });
    }
    options.push({ label: 'Rest Day', value: 'Rest Day', icon: 'fa-solid fa-bed' });
    options.push({ label: 'Cardio Workout', value: 'Cardio Workout', icon: 'fa-solid fa-person-running' });

    this.overrideOptions = options;

    // Pre-select current setting
    let initialVal = '';
    if (dayObj.override) {
      const val = dayObj.override.templateDayName || dayObj.routineName;
      initialVal = (val === 'Rest Day' || val === 'Cardio Workout') ? val : (dayObj.override.templateDayName || val);
    } else {
      initialVal = dayObj.templateDayName || dayObj.routineName;
    }
    this.overrideValueControl.setValue(initialVal);
    this.showOverrideModal = true;
  }

  closeOverrideModal(): void {
    this.showOverrideModal = false;
  }

  confirmOverride(): void {
    let selectedDay: any = null;
    const selectedOverrideValue = this.overrideValueControl.value;

    if (selectedOverrideValue === 'Rest Day') {
      selectedDay = { dayName: 'Rest Day', exercises: [] };
    } else if (selectedOverrideValue === 'Cardio Workout') {
      selectedDay = {
        dayName: 'Cardio Workout',
        exercises: [
          { name: 'Treadmill Run', sets: 1, reps: '30 mins', notes: 'Keep moderate intensity.' },
          { name: 'Stationary Bike', sets: 1, reps: '15 mins', notes: 'Warm down.' }
        ]
      };
    } else {
      const match = this.activeSplit?.days.find((d: any) => d.dayName === selectedOverrideValue);
      if (match) {
        selectedDay = {
          id: match.id,
          dayName: match.category ? `${match.dayName} - ${match.category}` : match.dayName,
          exercises: match.exercises,
          templateDayName: match.dayName
        };
      }
    }

    if (selectedDay) {
      this.updateOverrides.emit({
        dateKey: this.overrideDateKey,
        workout: selectedDay,
        scope: this.overrideScopeControl.value || 'single'
      });
      this.notification.success(`Updated routine for ${this.overrideDateLabel}!`);
    }

    this.closeOverrideModal();
  }

  onAssignSplit(): void {
    this.openAssignModal.emit();
  }

  trackTodayLive(): void {
    this.changeTab.emit('workout-track');
  }

  logPastWorkout(dayObj: any): void {
    this.logDateWorkout.emit({
      date: dayObj.date,
      routineName: dayObj.routineName,
      templateDayName: dayObj.templateDayName
    });
  }

  editWorkoutSession(session: any): void {
    this.editWorkout.emit(session);
  }
}
