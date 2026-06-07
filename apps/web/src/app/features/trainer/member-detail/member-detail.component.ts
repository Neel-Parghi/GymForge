import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffService } from '../../../core/services/staff.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { WorkoutPlanService } from '../../../core/services/workout-plan.service';
import { MemberService } from '../../../core/services/member.service';
import { WorkoutPlan, SplitPlanner, WeeklyPlanner, DailyPlanner } from '../../../shared/models/workout-plan.model';
import { PTMemberDetailOverviewComponent } from './components/member-detail-overview/member-detail-overview';
import { PTMemberDetailTrackPerformanceComponent } from './components/member-detail-track-performance/member-detail-track-performance';
import { PTMemberDetailWorkoutCalendarComponent } from './components/member-detail-workout-calendar/member-detail-workout-calendar';
import { PTMemberDetailDietChartComponent } from './components/member-detail-diet-chart/member-detail-diet-chart';
import { PTMemberDetailHealthTrackerComponent } from './components/member-detail-health-tracker/member-detail-health-tracker';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [
    CommonModule,
    PTMemberDetailOverviewComponent,
    PTMemberDetailTrackPerformanceComponent,
    PTMemberDetailWorkoutCalendarComponent,
    PTMemberDetailDietChartComponent,
    PTMemberDetailHealthTrackerComponent
  ],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.scss'
})
export class PTMemberDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private staffService = inject(StaffService);
  private authService = inject(AuthApiService);
  private notification = inject(NotificationService);
  private workoutPlanService = inject(WorkoutPlanService);
  private memberService = inject(MemberService);

  memberId = '';
  memberInfo: any = null;
  workoutPlans: WorkoutPlan[] = [];
  workoutHistory: any[] = [];
  activeTab: 'overview' | 'progress' | 'workout-track' | 'workout-calendar' | 'diet-chart' = 'overview';
  previousTab: 'overview' | 'progress' | 'workout-track' | 'workout-calendar' | 'diet-chart' | '' = '';
  workoutOverrides: { [dateKey: string]: any } = {};
  loggingDate: Date = new Date();

  // Measurement progress logs
  measurements: any[] = [];
  isSubmittingProgress = false;
  isLoadingLogs = false;

  // Split Assignments & Plan Libraries
  showAssignSplitModal = false;
  showAssignDietModal = false;

  // Active workout split mock data
  activeSplit: any = null;
  planAssignments: any[] = [];

  // Active Diet split mock data
  activeDiet = {
    planName: 'Lean Bulking 3000 kcal Plan',
    calories: 3000,
    macros: { protein: 180, carbs: 360, fats: 80 },
    meals: [
      { name: 'Meal 1: Breakfast (08:00 AM)', calories: 650, items: '100g Rolled Oats, 4 Egg Whites, 1 Scoop Whey Protein, 1 Banana, 15g Almonds' },
      { name: 'Meal 2: Mid-Day Snack (11:30 AM)', calories: 400, items: '200g Greek Yogurt (0% Fat), 100g Berries, 30g Honey' },
      { name: 'Meal 3: Lunch (02:00 PM)', calories: 750, items: '150g Grilled Chicken Breast, 150g Basmati Rice, Steamed Broccoli, 1 tbsp Olive Oil' },
      { name: 'Meal 4: Post-Workout (06:00 PM)', calories: 500, items: '2 Scoops Hydrolyzed Whey, 75g Cream of Rice, 1 Apple' },
      { name: 'Meal 5: Dinner (08:30 PM)', calories: 700, items: '150g Salmon Fillet, 200g Baked Sweet Potatoes, Asparagus' }
    ]
  };

  // Live Sets tracker mock checklist
  todayWorkout: any = null;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.memberId = params['memberId'];
      this.loadMemberInfo();
      this.loadMeasurementsLogs();
      this.loadWorkoutPlans();
      this.loadActivePlanAndWorkoutLogs();
    });
  }

  getTodayDateKey(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  initializeTodayWorkout(): void {
    if (!this.activeSplit || !this.activeSplit.days || this.activeSplit.days.length === 0) {
      this.todayWorkout = null;
      return;
    }

    const todayStr = this.getTodayDateKey();
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

    // 1. Find matching day in activeSplit
    let templateDay = this.activeSplit.days.find((d: any) =>
      d.dayName && d.dayName.toLowerCase().includes(todayName.toLowerCase())
    );

    // 2. Sequential fallback for abstract splits (Day 1, Day 2, etc.) mapped to Mon/Wed/Fri
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

  onUpdateOverrides(event: { dateKey: string, workout: any, scope?: 'single' | 'recurring' }): void {
    if (event.scope === 'recurring') {
      const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dateParts = event.dateKey.split('-');
      const localDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      const dayOfWeekName = weekdayNames[localDate.getDay()];

      const isRest = event.workout.dayName.toLowerCase().includes('rest');

      const payload = {
        dayOfWeek: dayOfWeekName,
        workoutPlanDayId: isRest ? null : event.workout.id,
        isRestDay: isRest
      };

      this.memberService.saveRecurringOverride(this.memberId, payload).subscribe({
        next: () => {
          this.loadActivePlanAndWorkoutLogs();
        },
        error: (err) => {
          console.error('Failed to save recurring override:', err);
          this.notification.error('Failed to save recurring override schedule.');
        }
      });
    } else {
      this.workoutOverrides = {
        ...this.workoutOverrides,
        [event.dateKey]: event.workout
      };

      const dateParts = event.dateKey.split('-');
      const localDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]), 12, 0, 0);

      const isRest = event.workout.dayName.toLowerCase().includes('rest');

      const payload = {
        date: localDate,
        dayName: event.workout.dayName,
        status: isRest ? 'RestDay' : 'Planned',
        notes: 'Scheduled Override',
        loggedExercises: (event.workout.exercises || []).map((ex: any) => ({
          name: ex.name,
          loggedSets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
            setNo: i + 1,
            weight: 0,
            reps: parseInt(ex.reps) || 10,
            completed: false
          }))
        }))
      };

      this.memberService.logWorkoutSession(this.memberId, payload).subscribe({
        next: () => {
          this.loadActivePlanAndWorkoutLogs();
          const todayStr = this.getDateKeyFor(new Date());
          if (event.dateKey === todayStr) {
            this.initializeTodayWorkout();
          }
        },
        error: (err) => {
          console.error('Failed to save override log:', err);
          this.notification.error('Failed to save override schedule to backend.');
        }
      });
    }
  }

  getDateKeyFor(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  onLogDateWorkout(event: { date: Date, routineName: string, templateDayName?: string }): void {
    this.loggingDate = event.date;

    // Find matching routine from split or overrides
    const dateStr = this.getDateKeyFor(event.date);
    const override = this.workoutOverrides[dateStr];

    let foundRoutine: any = null;
    if (override) {
      foundRoutine = override;
    } else if (this.activeSplit && this.activeSplit.days) {
      if (event.templateDayName) {
        foundRoutine = this.activeSplit.days.find((d: any) => d.dayName === event.templateDayName);
      }
      if (!foundRoutine) {
        foundRoutine = this.activeSplit.days.find((d: any) =>
          d.dayName === event.routineName ||
          d.category === event.routineName ||
          (d.category && event.routineName && d.category.toLowerCase().includes(event.routineName.toLowerCase()))
        );
      }
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
        dayName: event.routineName,
        isRestDay: event.routineName.toLowerCase().includes('rest'),
        exercises: []
      };
    }

    this.setTab('workout-track');
    this.notification.info(`Ready to log workout for: ${event.date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}`);
  }

  onEditWorkoutSession(session: any): void {
    this.loggingDate = new Date(session.date);

    const exercises = session.loggedExercises || session.exercises || [];
    this.todayWorkout = {
      dayName: session.dayName,
      isRestDay: session.dayName?.toLowerCase().includes('rest') || false,
      exercises: exercises.map((ex: any) => {
        const sets = [...(ex.loggedSets || ex.sets || [])].sort((a: any, b: any) => (a.setNo || 0) - (b.setNo || 0));
        return {
          name: ex.name,
          skipped: ex.skipped || false,
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

    this.setTab('workout-track');
    this.notification.info(`Editing workout session for: ${this.loggingDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}`);
  }

  loadWorkoutPlans(): void {
    this.workoutPlanService.getPlans().subscribe({
      next: (plans) => {
        this.workoutPlans = plans || [];
      },
      error: (err) => {
        console.error('Failed to load workout plans:', err);
      }
    });
  }

  setTab(tab: any): void {
    this.previousTab = this.activeTab;
    this.activeTab = tab;
  }

  onCancelWorkoutTrack(): void {
    this.loggingDate = new Date();
    this.initializeTodayWorkout();
    this.setTab('workout-calendar');
  }

  loadMemberInfo(): void {
    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.staffService.getAssignedMembers(profile.id).subscribe({
          next: (res: any) => {
            let list = res?.data || [];
            if (list.length === 0) {
              list = [
                { memberId: 'm-01', firstName: 'Neel', lastName: 'Parghi', email: 'neel@gymforge.com', membershipNumber: 'MEM-87265', assignedSlot: '07:00 AM', assignedDate: new Date(), status: 'Active' },
                { memberId: 'm-02', firstName: 'Aarav', lastName: 'Mehta', email: 'aarav@gymforge.com', membershipNumber: 'MEM-19028', assignedSlot: '09:00 AM', assignedDate: new Date(), status: 'Active' },
                { memberId: 'm-03', firstName: 'Rohan', lastName: 'Sharma', email: 'rohan@gymforge.com', membershipNumber: 'MEM-33049', assignedSlot: '11:00 AM', assignedDate: new Date(), status: 'Expired' }
              ];
            }
            this.memberInfo = list.find((m: any) => m.memberId === this.memberId) || list[0];
          },
          error: (err) => {
            console.error('Error fetching member details, using premium mock fallback:', err);
            const list = [
              { memberId: 'm-01', firstName: 'Neel', lastName: 'Parghi', email: 'neel@gymforge.com', membershipNumber: 'MEM-87265', assignedSlot: '07:00 AM', assignedDate: new Date(), status: 'Active' },
              { memberId: 'm-02', firstName: 'Aarav', lastName: 'Mehta', email: 'aarav@gymforge.com', membershipNumber: 'MEM-19028', assignedSlot: '09:00 AM', assignedDate: new Date(), status: 'Active' },
              { memberId: 'm-03', firstName: 'Rohan', lastName: 'Sharma', email: 'rohan@gymforge.com', membershipNumber: 'MEM-33049', assignedSlot: '11:00 AM', assignedDate: new Date(), status: 'Expired' }
            ];
            this.memberInfo = list.find((m: any) => m.memberId === this.memberId) || list[0];
          }
        });
      }
    });
  }

  loadMeasurementsLogs(): void {
    this.isLoadingLogs = true;
    this.staffService.getMemberMeasurements(this.memberId).subscribe({
      next: (res: any) => {
        this.measurements = res?.data || [];
        this.measurements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        if (this.measurements.length === 0) {
          this.measurements = [
            { id: 'm-log-1', weight: 78.5, height: 178, bodyFatPercentage: 14.5, bmi: 24.8, date: new Date(Date.now() - 86400000 * 30), recordedBy: 'Sam Trainer' },
            { id: 'm-log-2', weight: 81.2, height: 178, bodyFatPercentage: 16.2, bmi: 25.6, date: new Date(Date.now() - 86400000 * 60), recordedBy: 'Sam Trainer' }
          ];
        }
        this.isLoadingLogs = false;
      },
      error: () => {
        this.measurements = [
          { id: 'm-log-1', weight: 78.5, height: 178, bodyFatPercentage: 14.5, bmi: 24.8, date: new Date(Date.now() - 86400000 * 30), recordedBy: 'Sam Trainer' },
          { id: 'm-log-2', weight: 81.2, height: 178, bodyFatPercentage: 16.2, bmi: 25.6, date: new Date(Date.now() - 86400000 * 60), recordedBy: 'Sam Trainer' }
        ];
        this.isLoadingLogs = false;
      }
    });
  }

  submitProgress(formVal: any): void {
    this.isSubmittingProgress = true;
    this.staffService.recordMeasurement(this.memberId, {
      weight: formVal.weight,
      height: formVal.height,
      bodyFatPercentage: formVal.bodyFatPercentage || undefined,
      bmi: formVal.bmi || undefined,
      notes: formVal.notes || undefined
    }).subscribe({
      next: () => {
        this.notification.success('Progress record added!');
        this.loadMeasurementsLogs();
        this.isSubmittingProgress = false;
      },
      error: () => {
        const mockLog = {
          id: 'm-log-' + (this.measurements.length + 1),
          weight: formVal.weight,
          height: formVal.height,
          bodyFatPercentage: formVal.bodyFatPercentage || 15.0,
          bmi: formVal.bmi || 24.5,
          date: new Date(),
          recordedBy: 'Sam Trainer',
          notes: formVal.notes || undefined
        };
        this.measurements = [mockLog, ...this.measurements];
        this.notification.success('Progress record saved (Mock mode)!');
        this.isSubmittingProgress = false;
      }
    });
  }

  loadActivePlanAndWorkoutLogs(): void {
    this.memberService.getActivePlan(this.memberId).subscribe({
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

    this.memberService.getPlanAssignments(this.memberId).subscribe({
      next: (res: any) => {
        this.planAssignments = (res?.data || []).map((assignment: any) => {
          const plan = assignment.workoutPlan;
          return {
            id: assignment.id,
            assignedAt: new Date(assignment.assignedAt),
            isActive: assignment.isActive,
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
        });
      },
      error: () => {
        this.planAssignments = [];
      }
    });

    this.memberService.getWorkoutLogs(this.memberId).subscribe({
      next: (res: any) => {
        this.workoutHistory = res?.data || [];
      }
    });
  }

  saveWorkoutSession(): void {
    const isRest = this.todayWorkout.isRestDay || this.todayWorkout.dayName?.toLowerCase().includes('rest');
    let activeExercises = [];

    if (!isRest) {
      activeExercises = this.todayWorkout.exercises.filter((ex: any) => !ex.skipped);
      const completedSetsCount = activeExercises.reduce(
        (sum: number, ex: any) => sum + ex.sets.filter((s: any) => s.completed).length, 0
      );

      if (completedSetsCount === 0) {
        this.notification.warning('Please log at least one completed set before logging the session.');
        return;
      }
    }

    const payload = {
      date: new Date(this.loggingDate),
      dayName: this.todayWorkout.dayName,
      status: isRest ? 'RestDay' : 'Completed',
      notes: isRest ? 'Rest Day logged from tracker' : '',
      loggedExercises: isRest ? [] : activeExercises.map((ex: any) => ({
        name: ex.name,
        loggedSets: ex.sets.map((s: any) => ({
          setNo: s.setNo,
          weight: s.weight || 0,
          reps: s.reps || 0,
          completed: s.completed
        }))
      }))
    };

    this.memberService.logWorkoutSession(this.memberId, payload).subscribe({
      next: () => {
        this.notification.success(`Successfully logged workout session!`);
        this.loadActivePlanAndWorkoutLogs();
        this.loggingDate = new Date();
        if (this.previousTab === 'workout-calendar') {
          this.setTab('workout-calendar');
        }
      },
      error: () => {
        this.notification.error('Failed to log workout session to database.');
      }
    });
  }

  openAssignSplitModal(): void {
    this.showAssignSplitModal = true;
  }

  closeAssignSplitModal(): void {
    this.showAssignSplitModal = false;
  }

  assignWorkoutSplit(plan: WorkoutPlan | string): void {
    if (typeof plan === 'string') {
      // Mock split plan
      this.notification.warning('Cannot assign custom string plans in dynamic mode.');
    } else {
      if (plan.id) {
        this.memberService.assignPlan(this.memberId, plan.id).subscribe({
          next: () => {
            this.notification.success(`Assigned ${plan.name} to member!`);

            const todayStr = this.getTodayDateKey();
            const todayDate = new Date(todayStr);
            const updatedOverrides = { ...this.workoutOverrides };
            for (const key of Object.keys(updatedOverrides)) {
              if (new Date(key) >= todayDate) {
                delete updatedOverrides[key];
              }
            }
            this.workoutOverrides = updatedOverrides;

            this.loadActivePlanAndWorkoutLogs();
          },
          error: () => {
            this.notification.error('Failed to assign plan on backend.');
          }
        });
      } else {
        this.notification.error('Invalid Workout Plan ID.');
      }
    }
    this.closeAssignSplitModal();
  }

  openAssignDietModal(): void {
    this.showAssignDietModal = true;
  }

  closeAssignDietModal(): void {
    this.showAssignDietModal = false;
  }

  assignDietPlan(planName: string, calories: number, protein: number, carbs: number, fats: number): void {
    this.activeDiet = {
      planName: planName,
      calories: calories,
      macros: { protein, carbs, fats },
      meals: this.activeDiet.meals // Keep meals constant for mock demo
    };
    this.notification.success(`Assigned ${planName} diet template to ${this.memberInfo?.firstName}!`);
    this.closeAssignDietModal();
  }

  goBack(): void {
    if (this.activeTab === 'workout-track' && this.previousTab === 'workout-calendar') {
      this.onCancelWorkoutTrack();
    } else {
      this.router.navigate(['/trainer/members']);
    }
  }
}
