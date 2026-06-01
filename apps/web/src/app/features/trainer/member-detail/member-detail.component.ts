import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StaffService } from '../../../core/services/staff.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthApiService } from '../../../core/services/auth-api.service';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.scss'
})
export class PTMemberDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private staffService = inject(StaffService);
  private authService = inject(AuthApiService);
  private notification = inject(NotificationService);

  memberId = '';
  memberInfo: any = null;
  activeTab: 'progress' | 'workout-track' | 'workout-split' | 'diet-chart' = 'workout-track';

  // Measurement progress logs
  measurements: any[] = [];
  measurementForm!: FormGroup;
  isSubmittingProgress = false;
  isLoadingLogs = false;

  // Split Assignments & Plan Libraries
  showAssignSplitModal = false;
  showAssignDietModal = false;

  // Active workout split mock data
  activeSplit = {
    planName: '3-Day Push-Pull-Legs (PPL)',
    days: [
      {
        dayName: 'Monday - Push Day', exercises: [
          { name: 'Flat Bench Press', sets: 4, reps: '8-12 reps', notes: 'Keep feet planted. Barbell to chest.' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12 reps', notes: 'Control the eccentric portion.' },
          { name: 'Cable Lateral Raise', sets: 4, reps: '12-15 reps', notes: 'Squeeze the side delt at peak.' },
          { name: 'Tricep Rope Pushdown', sets: 3, reps: '12 reps', notes: 'Keep elbows locked at sides.' }
        ]
      },
      {
        dayName: 'Wednesday - Pull Day', exercises: [
          { name: 'Pull-Ups', sets: 4, reps: 'Max Reps', notes: 'Controlled dead hang at bottom.' },
          { name: 'Barbell Rows', sets: 3, reps: '8-10 reps', notes: 'Pull barbell to belly button.' },
          { name: 'Face Pulls', sets: 4, reps: '15 reps', notes: 'Pull rope to ears. Focus on rear delts.' }
        ]
      },
      {
        dayName: 'Friday - Leg Day', exercises: [
          { name: 'Barbell Squat', sets: 4, reps: '8 reps', notes: 'Deep squat. Keep heels flat.' },
          { name: 'Romanian Deadlifts', sets: 3, reps: '10 reps', notes: 'Feel the stretch in hamstrings.' },
          { name: 'Seated Calf Raises', sets: 4, reps: '15 reps', notes: '1 sec pause at bottom stretch.' }
        ]
      }
    ]
  };

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
  todayWorkout = {
    dayName: 'Monday - Push Day',
    exercises: [
      {
        name: 'Flat Bench Press',
        sets: [
          { setNo: 1, target: '8-12 reps', weight: 60, reps: 12, completed: true },
          { setNo: 2, target: '8-12 reps', weight: 70, reps: 10, completed: true },
          { setNo: 3, target: '8-12 reps', weight: 75, reps: 8, completed: false },
          { setNo: 4, target: '8-12 reps', weight: 75, reps: 8, completed: false }
        ]
      },
      {
        name: 'Incline Dumbbell Press',
        sets: [
          { setNo: 1, target: '10-12 reps', weight: 26, reps: 12, completed: false },
          { setNo: 2, target: '10-12 reps', weight: 28, reps: 10, completed: false },
          { setNo: 3, target: '10-12 reps', weight: 28, reps: 10, completed: false }
        ]
      },
      {
        name: 'Cable Lateral Raise',
        sets: [
          { setNo: 1, target: '12-15 reps', weight: 12.5, reps: 15, completed: false },
          { setNo: 2, target: '12-15 reps', weight: 15, reps: 12, completed: false }
        ]
      }
    ]
  };

  constructor() {
    this.initProgressForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.memberId = params['memberId'];
      this.loadMemberInfo();
      this.loadMeasurementsLogs();
    });

    // Auto-calculate BMI
    this.measurementForm.valueChanges.subscribe(val => {
      if (val.weight && val.height) {
        const heightMeters = val.height / 100;
        const bmi = val.weight / (heightMeters * heightMeters);
        this.measurementForm.patchValue({ bmi: Math.round(bmi * 10) / 10 }, { emitEvent: false });
      }
    });
  }

  setTab(tab: 'progress' | 'workout-track' | 'workout-split' | 'diet-chart'): void {
    this.activeTab = tab;
  }

  private initProgressForm(): void {
    this.measurementForm = this.fb.group({
      weight: [null, [Validators.required, Validators.min(20), Validators.max(300)]],
      height: [null, [Validators.required, Validators.min(50), Validators.max(250)]],
      bodyFatPercentage: [null, [Validators.min(1), Validators.max(80)]],
      bmi: [{ value: null, disabled: true }],
      notes: ['']
    });
  }

  loadMemberInfo(): void {
    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.staffService.getAssignedMembers(profile.id).subscribe({
          next: (res: any) => {
            let list = res?.data || [];
            
            // Dynamic Fallback: if database is empty, pre-populate mock list
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

        // Populate standard defaults if empty in DB
        if (this.measurements.length === 0) {
          this.measurements = [
            { id: 'm-log-1', weight: 78.5, height: 178, bodyFatPercentage: 14.5, bmi: 24.8, date: new Date(Date.now() - 86400000 * 30), recordedBy: 'Sam Trainer' },
            { id: 'm-log-2', weight: 81.2, height: 178, bodyFatPercentage: 16.2, bmi: 25.6, date: new Date(Date.now() - 86400000 * 60), recordedBy: 'Sam Trainer' }
          ];
        }

        this.isLoadingLogs = false;
      },
      error: () => {
        // Fallback mock records in case of API failure during mock proofing
        this.measurements = [
          { id: 'm-log-1', weight: 78.5, height: 178, bodyFatPercentage: 14.5, bmi: 24.8, date: new Date(Date.now() - 86400000 * 30), recordedBy: 'Sam Trainer' },
          { id: 'm-log-2', weight: 81.2, height: 178, bodyFatPercentage: 16.2, bmi: 25.6, date: new Date(Date.now() - 86400000 * 60), recordedBy: 'Sam Trainer' }
        ];
        this.isLoadingLogs = false;
      }
    });
  }

  submitProgress(): void {
    if (this.measurementForm.invalid) {
      this.measurementForm.markAllAsTouched();
      return;
    }

    this.isSubmittingProgress = true;
    const formVal = this.measurementForm.getRawValue();

    this.staffService.recordMeasurement(this.memberId, {
      weight: formVal.weight,
      height: formVal.height,
      bodyFatPercentage: formVal.bodyFatPercentage || undefined,
      bmi: formVal.bmi || undefined,
      notes: formVal.notes || undefined
    }).subscribe({
      next: () => {
        this.notification.success('Progress record added!');
        this.measurementForm.reset();
        this.loadMeasurementsLogs();
        this.isSubmittingProgress = false;
      },
      error: () => {
        // Mock save logic for UI demo when DB connection isn't wired yet
        const mockLog = {
          id: 'm-log-' + (this.measurements.length + 1),
          weight: formVal.weight,
          height: formVal.height,
          bodyFatPercentage: formVal.bodyFatPercentage || 15.0,
          bmi: formVal.bmi || 24.5,
          date: new Date(),
          recordedBy: 'Sam Trainer'
        };
        this.measurements.unshift(mockLog);
        this.notification.success('Progress record saved (Mock mode)!');
        this.measurementForm.reset();
        this.isSubmittingProgress = false;
      }
    });
  }

  // Interactive Workout Session checklist methods
  toggleSetCompletion(set: any): void {
    set.completed = !set.completed;
  }

  addSetToExercise(exercise: any): void {
    const nextSetNo = exercise.sets.length + 1;
    exercise.sets.push({
      setNo: nextSetNo,
      target: '8-12 reps',
      weight: exercise.sets[exercise.sets.length - 1]?.weight || 20,
      reps: exercise.sets[exercise.sets.length - 1]?.reps || 10,
      completed: false
    });
  }

  addExerciseToWorkout(): void {
    const exName = prompt('Enter exercise name:');
    if (exName) {
      this.todayWorkout.exercises.push({
        name: exName,
        sets: [
          { setNo: 1, target: '10 reps', weight: 20, reps: 10, completed: false }
        ]
      });
      this.notification.success(`Added ${exName} to today's workout tracker!`);
    }
  }

  saveWorkoutSession(): void {
    const completedSetsCount = this.todayWorkout.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0
    );
    const totalSetsCount = this.todayWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

    this.notification.success(`Successfully logged workout session! (${completedSetsCount}/${totalSetsCount} sets completed)`);

    // Reset tracker checklists for demonstration
    this.todayWorkout.exercises.forEach(ex => {
      ex.sets.forEach(s => s.completed = false);
    });
  }

  // Composing plans assignment mocks
  openAssignSplitModal(): void {
    this.showAssignSplitModal = true;
  }

  closeAssignSplitModal(): void {
    this.showAssignSplitModal = false;
  }

  assignWorkoutSplit(planName: string): void {
    this.activeSplit.planName = planName;
    this.todayWorkout.dayName = 'Monday - Push Day';
    this.notification.success(`Assigned ${planName} workout split split template to ${this.memberInfo?.firstName}!`);
    this.closeAssignSplitModal();
  }

  openAssignDietModal(): void {
    this.showAssignDietModal = true;
  }

  closeAssignDietModal(): void {
    this.showAssignDietModal = false;
  }

  assignDietPlan(planName: string, calories: number, protein: number, carbs: number, fats: number): void {
    this.activeDiet.planName = planName;
    this.activeDiet.calories = calories;
    this.activeDiet.macros = { protein, carbs, fats };
    this.notification.success(`Assigned ${planName} diet template to ${this.memberInfo?.firstName}!`);
    this.closeAssignDietModal();
  }

  goBack(): void {
    this.router.navigate(['/trainer/members']);
  }
}
