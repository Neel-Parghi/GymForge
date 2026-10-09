import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, filter, forkJoin, map, of } from 'rxjs';
import { WorkoutSessionComponent } from './components/workout-session/workout-session.component';
import { SessionWorkoutResult } from '../../../shared/models/workout-session.model';
import { MemberService } from '../../../core/services/member.service';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CONSTANTS } from '../../../core/constants/constants';
import { resolveScheduledDay, toDateKey } from '../../../shared/utils/workout-schedule';

@Component({
  selector: 'app-user-performance',
  standalone: true,
  imports: [CommonModule, WorkoutSessionComponent],
  templateUrl: './user-performance.component.html',
  styleUrl: './user-performance.component.scss',
})
export class UserPerformanceComponent implements OnInit {
  private memberService = inject(MemberService);
  private authService = inject(AuthApiService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  todayWorkout: any = null;
  activeSplit: any = null;
  loggingDate = new Date();
  workoutHistory: any[] = [];
  workoutOverrides: { [dateKey: string]: any } = {};
  userId = '';

  routerState: any = null;

  ngOnInit() {
    this.routerState = history.state;

    if (this.routerState?.loggingDate) {
      this.loggingDate = new Date(this.routerState.loggingDate);
    } else if (this.routerState?.sessionToEdit && this.routerState.sessionToEdit.date) {
      this.loggingDate = new Date(this.routerState.sessionToEdit.date);
    }

    // Only reload when the user actually changes; a profile refresh must not reset an open session.
    this.authService.userProfile$.pipe(
      map(profile => profile?.id),
      filter((id): id is string => !!id),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(id => {
      this.userId = id;
      this.loadActivePlanAndWorkoutLogs();
    });
  }

  /**
   * Loads the plan and logs together and builds the session once. Building it per response
   * handed the session a fresh workout mid-workout, wiping swaps/added exercises back to the plan.
   */
  loadActivePlanAndWorkoutLogs(): void {
    forkJoin({
      plan: this.memberService.getActivePlan(this.userId).pipe(catchError(() => of(null))),
      logs: this.memberService.getWorkoutLogs(this.userId).pipe(catchError(() => of(null)))
    }).subscribe(({ plan: planRes, logs }: { plan: any; logs: any }) => {
      if (logs) {
        this.workoutHistory = logs.data || [];
      }

      const plan = planRes?.data;
      if (plan) {
        this.activeSplit = {
          planName: plan.name,
          days: (plan.days || []).map((d: any) => ({
            id: d.id,
            dayName: d.isRestDay ? `${d.dayName || ('Day ' + d.dayIndex)} - Rest Day` : (d.dayName || ('Day ' + d.dayIndex)),
            isRestDay: d.isRestDay,
            category: d.category || '',
            exercises: (d.exercises || []).map((ex: any) => ({
              name: ex.exerciseName,
              sets: ex.sets,
              reps: ex.reps,
              notes: ex.notes || ''
            }))
          }))
        };
      } else {
        this.activeSplit = null;
      }

      this.initializeTodayWorkout();
    });
  }

  initializeTodayWorkout(): void {
    if (this.routerState?.sessionToEdit) {
      this.todayWorkout = this.fromLoggedSession(this.routerState.sessionToEdit);
      return;
    }

    if (this.routerState?.routineName && this.activeSplit && this.activeSplit.days) {
      let foundRoutine: any = null;
      if (this.routerState.templateDayName) {
        foundRoutine = this.activeSplit.days.find((d: any) => d.dayName === this.routerState.templateDayName);
      }
      if (!foundRoutine) {
        foundRoutine = this.activeSplit.days.find((d: any) =>
          d.dayName === this.routerState.routineName ||
          d.category === this.routerState.routineName ||
          (d.category && this.routerState.routineName && d.category.toLowerCase().includes(this.routerState.routineName.toLowerCase()))
        );
      }

      if (foundRoutine) {
        this.todayWorkout = {
          dayName: foundRoutine.category ? `${foundRoutine.dayName} - ${foundRoutine.category}` : foundRoutine.dayName,
          isRestDay: foundRoutine.isRestDay || foundRoutine.dayName.toLowerCase().includes('rest'),
          exercises: (foundRoutine.exercises || []).map((ex: any) => ({
            name: ex.name,
            skipped: false,
            sets: Array.from({ length: typeof ex.sets === 'number' ? ex.sets : 3 }, (_, i) => ({
              setNo: i + 1,
              target: typeof ex.reps === 'string' ? ex.reps : '8-12 reps',
              weight: '',
              reps: 10,
              completed: false
            }))
          }))
        };
      } else {
        this.todayWorkout = {
          dayName: this.routerState.routineName,
          isRestDay: this.routerState.routineName.toLowerCase().includes('rest'),
          exercises: []
        };
      }
      return;
    }

    if (!this.activeSplit || !this.activeSplit.days || this.activeSplit.days.length === 0) {
      this.todayWorkout = null;
      return;
    }

    const todayStr = toDateKey(this.loggingDate);
    const override = this.workoutOverrides[todayStr];
    const existingSession = override ? null : this.workoutHistory?.find(h => toDateKey(new Date(h.date)) === todayStr);

    if (existingSession) {
      this.todayWorkout = this.fromLoggedSession(existingSession);
      return;
    }

    if (override) {
      this.todayWorkout = {
        dayName: override.dayName,
        isRestDay: override.dayName.toLowerCase().includes('rest'),
        exercises: (override.exercises || []).map((ex: any) => ({
          name: ex.name,
          skipped: false,
          sets: Array.from({ length: typeof ex.sets === 'number' ? ex.sets : 3 }, (_, i) => ({
            setNo: i + 1,
            target: typeof ex.reps === 'string' ? ex.reps : '8-12 reps',
            weight: '',
            reps: 10,
            completed: false
          }))
        }))
      };
      return;
    }

    const templateDay = resolveScheduledDay<any>(this.activeSplit.days, new Date());

    if (templateDay) {
      this.todayWorkout = {
        dayName: templateDay.category ? `${templateDay.dayName} - ${templateDay.category}` : templateDay.dayName,
        isRestDay: templateDay.isRestDay || templateDay.dayName.toLowerCase().includes('rest'),
        exercises: templateDay.isRestDay ? [] : templateDay.exercises.map((ex: any) => ({
          name: ex.name,
          skipped: false,
          sets: Array.from({ length: typeof ex.sets === 'number' ? ex.sets : (parseInt(ex.reps) || 3) }, (_, i) => ({
            setNo: i + 1,
            target: typeof ex.reps === 'string' ? ex.reps : '8-12 reps',
            weight: '',
            reps: 10,
            completed: false
          }))
        }))
      };
    } else {
      this.todayWorkout = {
        dayName: 'Rest Day',
        isRestDay: true,
        exercises: []
      };
    }
  }

  private fromLoggedSession(session: any): any {
    const rawExercises = session.loggedExercises || session.exercises || [];
    const sortedExercises = [...rawExercises].sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return {
      dayName: session.dayName,
      isRestDay: session.status === 'RestDay' || session.dayName?.toLowerCase().includes('rest') || false,
      exercises: sortedExercises.map((ex: any) => {
        const sets = [...(ex.loggedSets || ex.sets || [])].sort((a: any, b: any) => (a.setNo || 0) - (b.setNo || 0));
        return {
          name: ex.name,
          skipped: ex.skipped || false,
          isCardio: ex.isCardio || false,
          sets: sets.length
            ? sets.map((s: any) => ({
                setNo: s.setNo,
                target: s.target || `${s.reps || 10} reps`,
                weight: s.weight || 0,
                reps: s.reps || 0,
                completed: s.completed ?? true
              }))
            : this.blankSets(ex.name, ex.isCardio)
        };
      })
    };
  }

  /** Blank sets for an exercise, sized from the active plan when it lists the exercise. */
  private blankSets(name: string, isCardio: boolean): any[] {
    const planned = this.activeSplit?.days
      ?.flatMap((d: any) => d.exercises || [])
      .find((e: any) => e.name?.toLowerCase().trim() === name?.toLowerCase().trim());
    const count = typeof planned?.sets === 'number' && planned.sets > 0 ? planned.sets : 3;
    const target = typeof planned?.reps === 'string' && planned.reps ? planned.reps : (isCardio ? '20 mins' : '8-12 reps');
    return Array.from({ length: count }, (_, i) => ({
      setNo: i + 1,
      target,
      weight: '',
      reps: isCardio ? 20 : 10,
      completed: false
    }));
  }

  private isFutureLoggingDate(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const logD = new Date(this.loggingDate);
    logD.setHours(0, 0, 0, 0);
    return logD.getTime() > today.getTime();
  }

  saveWorkoutSession(session?: SessionWorkoutResult): void {
    if (session) {
      this.todayWorkout = session;
    }
    if (!this.todayWorkout) return;

    if (this.isFutureLoggingDate()) {
      this.notification.error('You cannot log a workout for a future date.');
      return;
    }

    const isRest = this.todayWorkout.isRestDay || this.todayWorkout.dayName?.toLowerCase().includes('rest');

    if (!isRest) {
      const nonSkippedExercises = this.todayWorkout.exercises.filter((ex: any) => !ex.skipped);
      const completedSetsCount = nonSkippedExercises.reduce(
        (sum: number, ex: any) => sum + ex.sets.filter((s: any) => s.completed).length, 0
      );

      if (completedSetsCount === 0) {
        this.notification.warning(CONSTANTS.MEMBER_DETAIL_MODULE.MIN_COMPLETED_SET_WARNING);
        return;
      }
    }

    const payload = {
      date: new Date(this.loggingDate),
      dayName: this.todayWorkout.dayName,
      status: isRest ? 'RestDay' : 'Completed',
      notes: isRest ? 'Rest Day logged from tracker' : '',
      loggedExercises: isRest ? [] : this.todayWorkout.exercises.map((ex: any, idx: number) => ({
        name: ex.name,
        skipped: ex.skipped || false,
        sortOrder: idx,
        isCardio: ex.isCardio || false,
        loggedSets: ex.skipped ? [] : ex.sets.map((s: any) => ({
          setNo: s.setNo,
          weight: s.weight || 0,
          reps: s.reps || 0,
          completed: s.completed
        }))
      }))
    };

    this.memberService.logWorkoutSession(this.userId, payload).subscribe({
      next: () => {
        this.notification.success(CONSTANTS.MEMBER_DETAIL_MODULE.LOG_WORKOUT_SUCCESS);
        this.routerState = null;
        this.loadActivePlanAndWorkoutLogs();
      },
      error: () => {
        this.notification.error(CONSTANTS.MEMBER_DETAIL_MODULE.LOG_WORKOUT_ERROR);
      }
    });
  }

  goBackToCalendar(): void {
    this.router.navigate(['/user/workout-calendar']);
  }

  /** Backdated sessions return to the calendar they came from; live ones to Training. */
  leaveSession(): void {
    const isToday = toDateKey(this.loggingDate) === toDateKey(new Date());
    if (isToday) {
      this.router.navigate(['/user/workout-planner']);
    } else {
      this.goBackToCalendar();
    }
  }
}
