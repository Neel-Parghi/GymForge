import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PTMemberDetailTrackPerformanceComponent } from '../../trainer/member-detail/components/member-detail-track-performance/member-detail-track-performance.component';
import { MemberService } from '../../../core/services/member.service';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CONSTANTS } from '../../../core/constants/constants';

@Component({
  selector: 'app-user-performance',
  standalone: true,
  imports: [CommonModule, PTMemberDetailTrackPerformanceComponent],
  templateUrl: './user-performance.component.html',
  styleUrl: './user-performance.component.scss',
})
export class UserPerformanceComponent implements OnInit {
  private memberService = inject(MemberService);
  private authService = inject(AuthApiService);
  private notification = inject(NotificationService);
  private router = inject(Router);

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

    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.userId = profile.id;
        this.loadActivePlanAndWorkoutLogs();
      }
    });
  }

  loadActivePlanAndWorkoutLogs(): void {
    this.memberService.getActivePlan(this.userId).subscribe({
      next: (res: any) => {
        const plan = res?.data;
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
          this.initializeTodayWorkout();
        } else {
          this.activeSplit = null;
          this.todayWorkout = null;
        }
      },
      error: () => {
        this.activeSplit = null;
        this.todayWorkout = null;
      }
    });

    this.memberService.getWorkoutLogs(this.userId).subscribe({
      next: (res: any) => {
        this.workoutHistory = res?.data || [];
        this.initializeTodayWorkout();
      }
    });
  }

  getTodayDateKey(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  getDateKeyFor(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  initializeTodayWorkout(): void {
    if (this.routerState?.sessionToEdit) {
      const session = this.routerState.sessionToEdit;
      const rawExercises = session.loggedExercises || session.exercises || [];
      const sortedExercises = [...rawExercises].sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      this.todayWorkout = {
        dayName: session.dayName,
        isRestDay: session.dayName?.toLowerCase().includes('rest') || false,
        exercises: sortedExercises.map((ex: any) => {
          const sets = [...(ex.loggedSets || ex.sets || [])].sort((a: any, b: any) => (a.setNo || 0) - (b.setNo || 0));
          return {
            name: ex.name,
            skipped: ex.skipped || false,
            isCardio: ex.isCardio || false,
            sets: sets.map((s: any) => ({
              setNo: s.setNo,
              target: s.target || `${s.reps || 10} reps`,
              weight: s.weight || 0,
              reps: s.reps || 0,
              completed: s.completed ?? true
            }))
          };
        })
      };
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
              weight: 20,
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

    const todayStr = this.getDateKeyFor(this.loggingDate);
    let override = this.workoutOverrides[todayStr];

    if (!override && this.workoutHistory) {
      const existingSession = this.workoutHistory.find(h => {
        const d = new Date(h.date);
        return this.getDateKeyFor(d) === todayStr;
      });
      if (existingSession) {
        override = {
          dayName: existingSession.dayName,
          exercises: (existingSession.loggedExercises || existingSession.exercises || []).map((ex: any) => ({
            name: ex.name,
            sets: ex.loggedSets || ex.sets || [],
            reps: (ex.loggedSets || ex.sets || [])[0]?.reps?.toString() || '8-12 reps',
            isLoggedSession: true
          }))
        };
      }
    }

    if (override) {
      this.todayWorkout = {
        dayName: override.dayName,
        isRestDay: override.dayName.toLowerCase().includes('rest'),
        exercises: (override.exercises || []).map((ex: any) => {
          const isLogged = !!ex.isLoggedSession;
          const rawSets = isLogged ? ex.sets : [];
          const setsCount = isLogged ? rawSets.length : (typeof ex.sets === 'number' ? ex.sets : 3);

          return {
            name: ex.name,
            skipped: false,
            sets: Array.from({ length: setsCount }, (_, i) => {
              if (isLogged) {
                const s = rawSets[i];
                return {
                  setNo: s.setNo || (i + 1),
                  target: s.target || `${s.reps || 10} reps`,
                  weight: s.weight || 0,
                  reps: s.reps || 0,
                  completed: s.completed ?? true
                };
              } else {
                return {
                  setNo: i + 1,
                  target: typeof ex.reps === 'string' ? ex.reps : '8-12 reps',
                  weight: 20,
                  reps: 10,
                  completed: false
                };
              }
            })
          };
        })
      };
      return;
    }

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = daysOfWeek[new Date().getDay()];

    let templateDay = this.activeSplit.days.find((d: any) =>
      d.dayName && d.dayName.toLowerCase().includes(todayName.toLowerCase())
    );

    if (!templateDay && this.activeSplit.days.length > 0) {
      const isAbstractSplit = !this.activeSplit.days.some((d: any) =>
        daysOfWeek.some(w => d.dayName.toLowerCase().includes(w.toLowerCase()))
      );
      if (isAbstractSplit) {
        if (todayName === 'Monday') {
          templateDay = this.activeSplit.days[0];
        } else if (todayName === 'Wednesday' && this.activeSplit.days.length > 1) {
          templateDay = this.activeSplit.days[1];
        } else if (todayName === 'Friday' && this.activeSplit.days.length > 2) {
          templateDay = this.activeSplit.days[2];
        }
      }
    }

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
            weight: 20,
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

  private isFutureLoggingDate(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const logD = new Date(this.loggingDate);
    logD.setHours(0, 0, 0, 0);
    return logD.getTime() > today.getTime();
  }

  saveWorkoutSession(): void {
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
        this.loadActivePlanAndWorkoutLogs();
        this.loggingDate = new Date();
      },
      error: () => {
        this.notification.error(CONSTANTS.MEMBER_DETAIL_MODULE.LOG_WORKOUT_ERROR);
      }
    });
  }

  goBackToCalendar(): void {
    this.router.navigate(['/user/workout-calendar']);
  }
}
