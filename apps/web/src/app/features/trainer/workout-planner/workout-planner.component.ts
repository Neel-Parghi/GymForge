import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import { WorkoutMasterService } from '../../../core/services/workout-master.service';
import { Exercise } from '../../../shared/models/exercise.model';
import { TimetableModalComponent } from './components/timetable-modal/timetable-modal.component';
import { SplitPlannerCreatorComponent } from './components/split-planner-creator/split-planner-creator.component';
import { WeeklyPlannerCreatorComponent } from './components/weekly-planner-creator/weekly-planner-creator.component';
import { DailyPlannerCreatorComponent } from './components/daily-planner-creator/daily-planner-creator.component';

interface PlannerExercise {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
}

interface SplitDay {
  name: string;
  category: string;
  exercises: PlannerExercise[];
}

interface SplitPlanner {
  id: string;
  name: string;
  description: string;
  level: string;
  goal: string;
  daysCount: number;
  exercisesCount: number;
  days: SplitDay[];
  createdAt: Date;
}

interface WeeklyDayPlan {
  dayName: string;
  type: 'workout' | 'rest';
  targetCategory?: string;
  splitDayName?: string;
  exercises: PlannerExercise[];
}

interface WeeklyPlanner {
  id: string;
  name: string;
  description: string;
  level: string;
  goal: string;
  activeDaysCount: number;
  calendar: WeeklyDayPlan[];
  createdAt: Date;
}

@Component({
  selector: 'app-workout-planner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TimetableModalComponent,
    SplitPlannerCreatorComponent,
    WeeklyPlannerCreatorComponent,
    DailyPlannerCreatorComponent
  ],
  templateUrl: './workout-planner.component.html',
  styleUrl: './workout-planner.component.scss'
})
export class WorkoutPlannerComponent implements OnInit {
  private notification = inject(NotificationService);
  private workoutMasterService = inject(WorkoutMasterService);

  activeTab: 'splits' | 'weekly' | 'daily' = 'splits';

  // Modal toggle states
  showCreateSplitModal = false;
  showCreateWeeklyModal = false;
  showCreateDailyModal = false;
  showDetailsModal = false;

  // Editing template states
  editingSplitPlan: any = null;
  editingWeeklyPlan: any = null;
  editingDailyPlan: any = null;

  // Timetable Detail Modal State
  selectedPlanner: any = null;
  selectedPlannerType: 'split' | 'weekly' | 'daily' = 'split';

  // Master Exercise References loaded for sub-components
  categories: string[] = [];
  exercisesMap: { [category: string]: Exercise[] } = {};

  // Seeded templates
  splitPlanners: SplitPlanner[] = [
    {
      id: 'split-tpl-1',
      name: 'Hypertrophy Push-Pull-Legs (3-Day)',
      description: 'Maximize muscular growth by isolating pushes (Chest/Shoulders/Triceps), pulls (Back/Biceps), and legs on alternate days.',
      level: 'Intermediate',
      goal: 'Hypertrophy',
      daysCount: 3,
      exercisesCount: 12,
      createdAt: new Date(),
      days: [
        {
          name: 'Push Focus',
          category: 'Chest',
          exercises: [
            { name: 'Incline Bench Press', sets: 4, reps: '8-12 reps', notes: 'Focus on chest contractions' },
            { name: 'Flat DB Press', sets: 3, reps: '10 reps', notes: 'Maintain full range of motion' },
            { name: 'Lateral Raises', sets: 4, reps: '12-15 reps', notes: 'Keep elbows high' },
            { name: 'Tricep Rope Pushdowns', sets: 3, reps: '12 reps', notes: 'Flare ends at the bottom' }
          ]
        },
        {
          name: 'Pull Focus',
          category: 'Back',
          exercises: [
            { name: 'Pull-Ups', sets: 4, reps: 'Max reps', notes: 'Dead hang to chest-to-bar' },
            { name: 'Barbell Rows', sets: 3, reps: '8-10 reps', notes: 'Keep back flat, row to waist' },
            { name: 'Dumbbell Rows', sets: 3, reps: '10 reps', notes: 'Isolate each side' },
            { name: 'Barbell Curls', sets: 3, reps: '12 reps', notes: 'Avoid momentum' }
          ]
        },
        {
          name: 'Legs Focus',
          category: 'Legs',
          exercises: [
            { name: 'Barbell Squats', sets: 4, reps: '8 reps', notes: 'Squat deep, parallel' },
            { name: 'Romanian Deadlifts', sets: 3, reps: '10 reps', notes: 'Hip hinge, squeeze glutes' },
            { name: 'Leg Press', sets: 3, reps: '12 reps', notes: 'Control eccentric descent' },
            { name: 'Plank Holds', sets: 3, reps: '60s hold', notes: 'Tight core and glutes' }
          ]
        }
      ]
    },
    {
      id: 'split-tpl-2',
      name: 'Elite 4-Day Strength & Power Routine',
      description: 'Focused around heavy compound movements (Squat, Bench, Deadlift, OHP) designed to build raw athletic power.',
      level: 'Advanced',
      goal: 'Strength & Power',
      daysCount: 4,
      exercisesCount: 16,
      createdAt: new Date(),
      days: [
        {
          name: 'Heavy Bench Focus',
          category: 'Chest',
          exercises: [
            { name: 'Flat Bench Press', sets: 5, reps: '5 reps', notes: 'Heavy strength effort' },
            { name: 'Dips', sets: 3, reps: '8 reps', notes: 'Lean chest forward' },
            { name: 'Dumbbell Rows', sets: 4, reps: '10 reps', notes: 'Squeeze shoulder blades' },
            { name: 'Plank Holds', sets: 3, reps: '60s hold', notes: 'Core rigidity' }
          ]
        },
        {
          name: 'Deadlift Power Day',
          category: 'Back',
          exercises: [
            { name: 'Deadlifts', sets: 5, reps: '3-5 reps', notes: 'Pull standard, brace hard' },
            { name: 'Lat Pulldowns', sets: 4, reps: '8-10 reps', notes: 'Pull to upper chest' },
            { name: 'Barbell Rows', sets: 3, reps: '8 reps', notes: 'Focus on lower lat row' },
            { name: 'Barbell Curls', sets: 3, reps: '10 reps', notes: 'Strict form curl' }
          ]
        },
        {
          name: 'Overhead Press Focus',
          category: 'Shoulders',
          exercises: [
            { name: 'Standing Overhead Press', sets: 5, reps: '5 reps', notes: 'Strict overhead push' },
            { name: 'Lateral Raises', sets: 4, reps: '12 reps', notes: 'Control deceleration' },
            { name: 'Tricep Rope Pushdowns', sets: 4, reps: '10 reps', notes: 'Hold lockout 1s' },
            { name: 'Plank Holds', sets: 3, reps: '60s hold', notes: 'Tension lock' }
          ]
        },
        {
          name: 'Heavy Squats Focus',
          category: 'Legs',
          exercises: [
            { name: 'Barbell Squats', sets: 5, reps: '5 reps', notes: 'Drive out of the hole' },
            { name: 'Romanian Deadlifts', sets: 4, reps: '8 reps', notes: 'Stretch hamstrings' },
            { name: 'Leg Press', sets: 3, reps: '10 reps', notes: 'Keep feet flat' },
            { name: 'Plank Holds', sets: 3, reps: '60s hold', notes: 'Solid spine support' }
          ]
        }
      ]
    }
  ];

  weeklyPlanners: WeeklyPlanner[] = [
    {
      id: 'weekly-tpl-1',
      name: 'Elite 5-Day Hypertrophy Cycle',
      description: 'A Monday-to-Sunday structure mapping push, pull, legs, and shoulder splits for advanced clients.',
      level: 'Advanced',
      goal: 'Hypertrophy',
      activeDaysCount: 5,
      createdAt: new Date(),
      calendar: [
        {
          dayName: 'Monday',
          type: 'workout',
          targetCategory: 'Chest',
          splitDayName: 'Push Focus',
          exercises: [
            { name: 'Incline Bench Press', sets: 4, reps: '8-12 reps', notes: 'Focus on upper chest' },
            { name: 'Flat DB Press', sets: 3, reps: '10 reps', notes: 'Slow eccentric control' },
            { name: 'Lateral Raises', sets: 4, reps: '12-15 reps', notes: 'Dumbbells to side' },
            { name: 'Tricep Rope Pushdowns', sets: 3, reps: '12 reps', notes: 'Peak contraction squeeze' }
          ]
        },
        {
          dayName: 'Tuesday',
          type: 'workout',
          targetCategory: 'Back',
          splitDayName: 'Pull Focus',
          exercises: [
            { name: 'Pull-Ups', sets: 4, reps: 'Max reps', notes: 'Chest to bar pull' },
            { name: 'Barbell Rows', sets: 3, reps: '8-10 reps', notes: 'Maintain strict flat spine' },
            { name: 'Dumbbell Rows', sets: 3, reps: '12 reps', notes: 'Pull row to hip crease' },
            { name: 'Barbell Curls', sets: 3, reps: '10 reps', notes: 'Strict biceps curl' }
          ]
        },
        {
          dayName: 'Wednesday',
          type: 'workout',
          targetCategory: 'Cardio',
          splitDayName: 'Active Cardio',
          exercises: [
            { name: 'Treadmill Run', sets: 1, reps: '30 mins', notes: 'Steady state zone 2 cardio' },
            { name: 'Plank Holds', sets: 3, reps: '60s hold', notes: 'Core brace alignment' }
          ]
        },
        {
          dayName: 'Thursday',
          type: 'workout',
          targetCategory: 'Legs',
          splitDayName: 'Legs Focus',
          exercises: [
            { name: 'Barbell Squats', sets: 4, reps: '8 reps', notes: 'Deep back squats' },
            { name: 'Romanian Deadlifts', sets: 3, reps: '10 reps', notes: 'Hinge hips back' },
            { name: 'Leg Press', sets: 3, reps: '12 reps', notes: 'Controlled quad press' }
          ]
        },
        {
          dayName: 'Friday',
          type: 'workout',
          targetCategory: 'Shoulders',
          splitDayName: 'Shoulder Accessory',
          exercises: [
            { name: 'Standing Overhead Press', sets: 4, reps: '8 reps', notes: 'Military style bar press' },
            { name: 'Lateral Raises', sets: 4, reps: '12-15 reps', notes: 'Burnout side delts' },
            { name: 'Tricep Rope Pushdowns', sets: 3, reps: '15 reps', notes: 'Volume triceps pushdown' },
            { name: 'Plank Holds', sets: 3, reps: '60s hold', notes: 'Wrap up with core hold' }
          ]
        },
        { dayName: 'Saturday', type: 'rest', exercises: [] },
        { dayName: 'Sunday', type: 'rest', exercises: [] }
      ]
    }
  ];

  dailyPlanners: any[] = [
    {
      id: 'daily-tpl-1',
      name: 'Hypertrophy Pull: Heavy Back & Biceps Focus',
      description: 'A complete individual pulling routine emphasizing deep lat stretch lat pulldowns and dumbbell rows.',
      level: 'Advanced',
      goal: 'Hypertrophy',
      targetCategory: 'Back + Biceps',
      createdAt: new Date(),
      exercises: [
        { name: 'Deadlifts', sets: 4, reps: '5 reps', notes: 'Keep back flat, drive with legs' },
        { name: 'Lat Pulldowns', sets: 4, reps: '10-12 reps', notes: 'Squeeze shoulder blades at chest' },
        { name: 'Dumbbell Rows', sets: 3, reps: '10 reps', notes: 'Strict form pull to hips' },
        { name: 'Barbell Curls', sets: 3, reps: '12 reps', notes: 'Focus on eccentric deceleration' }
      ]
    },
    {
      id: 'daily-tpl-2',
      name: 'Chest & Arms Push Workout Session',
      description: 'Standalone upper body pushes emphasizing chest press and overhead press, with targeted triceps volume rope pulldowns.',
      level: 'Intermediate',
      goal: 'Hypertrophy',
      targetCategory: 'Chest + Shoulders + Triceps',
      createdAt: new Date(),
      exercises: [
        { name: 'Flat Bench Press', sets: 4, reps: '8-10 reps', notes: 'Full control to lower chest' },
        { name: 'Standing Overhead Press', sets: 3, reps: '8 reps', notes: 'Military style strict bar push' },
        { name: 'Dips', sets: 3, reps: 'Max reps', notes: 'Keep posture slightly forward' },
        { name: 'Tricep Rope Pushdowns', sets: 3, reps: '12 reps', notes: 'Hold triceps lock at bottom' }
      ]
    }
  ];

  private saveToStorage(): void {
    localStorage.setItem('gymforge_split_planners', JSON.stringify(this.splitPlanners));
    localStorage.setItem('gymforge_weekly_planners', JSON.stringify(this.weeklyPlanners));
    localStorage.setItem('gymforge_daily_planners', JSON.stringify(this.dailyPlanners));
  }

  ngOnInit(): void {
    // Load from local storage if exists, otherwise seed initial default values
    const storedSplits = localStorage.getItem('gymforge_split_planners');
    const storedWeekly = localStorage.getItem('gymforge_weekly_planners');
    const storedDaily = localStorage.getItem('gymforge_daily_planners');

    if (storedSplits) {
      this.splitPlanners = JSON.parse(storedSplits);
    } else {
      localStorage.setItem('gymforge_split_planners', JSON.stringify(this.splitPlanners));
    }

    if (storedWeekly) {
      this.weeklyPlanners = JSON.parse(storedWeekly);
    } else {
      localStorage.setItem('gymforge_weekly_planners', JSON.stringify(this.weeklyPlanners));
    }

    if (storedDaily) {
      this.dailyPlanners = JSON.parse(storedDaily);
    } else {
      localStorage.setItem('gymforge_daily_planners', JSON.stringify(this.dailyPlanners));
    }

    // Fetch exercise reference lists from Master API
    this.workoutMasterService.getCategories().subscribe(cats => this.categories = cats);
    this.workoutMasterService.getExercises().subscribe(exercises => {
      const grouped: { [category: string]: Exercise[] } = {};
      exercises.forEach(ex => {
        if (!grouped[ex.category]) {
          grouped[ex.category] = [];
        }
        grouped[ex.category].push(ex);
      });
      this.exercisesMap = grouped;
    });
  }

  setTab(tab: 'splits' | 'weekly' | 'daily'): void {
    this.activeTab = tab;
  }

  getCategoryIcon(category: string): string {
    switch (category?.toLowerCase()) {
      case 'chest': return 'fa-dumbbell';
      case 'back': return 'fa-angles-up';
      case 'shoulders': return 'fa-arrows-up-to-line';
      case 'legs': return 'fa-shoe-prints';
      case 'biceps': return 'fa-hand-fist';
      case 'triceps': return 'fa-hand-fist';
      case 'core': return 'fa-shield-halved';
      case 'cardio': return 'fa-person-running';
      default: return 'fa-dumbbell';
    }
  }

  // Details pop-up trigger
  openDetailsModal(planner: any, type: 'split' | 'weekly' | 'daily'): void {
    if (type === 'daily') {
      // Map standalone daily plan to a virtual 1-day split planner for timetable-modal compatibility
      this.selectedPlanner = {
        id: planner.id,
        name: planner.name,
        description: planner.description,
        level: planner.level,
        goal: planner.goal,
        daysCount: 1,
        exercisesCount: planner.exercises.length,
        days: [
          {
            name: 'Workout Session',
            category: planner.targetCategory,
            exercises: planner.exercises
          }
        ]
      };
      this.selectedPlannerType = 'daily';
    } else {
      this.selectedPlanner = planner;
      this.selectedPlannerType = type;
    }
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedPlanner = null;
  }

  // Create triggers
  openCreatorModal(): void {
    if (this.activeTab === 'splits') {
      this.openCreateSplitModal();
    } else if (this.activeTab === 'weekly') {
      this.openCreateWeeklyModal();
    } else {
      this.openCreateDailyModal();
    }
  }

  openCreateSplitModal(): void { this.showCreateSplitModal = true; }
  closeCreateSplitModal(): void {
    this.showCreateSplitModal = false;
    this.editingSplitPlan = null;
  }

  openCreateWeeklyModal(): void { this.showCreateWeeklyModal = true; }
  closeCreateWeeklyModal(): void {
    this.showCreateWeeklyModal = false;
    this.editingWeeklyPlan = null;
  }

  openCreateDailyModal(): void { this.showCreateDailyModal = true; }
  closeCreateDailyModal(): void {
    this.showCreateDailyModal = false;
    this.editingDailyPlan = null;
  }

  editPlanner(plan: any, type: 'split' | 'weekly' | 'daily', event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (type === 'split') {
      this.editingSplitPlan = plan;
      this.showCreateSplitModal = true;
    } else if (type === 'weekly') {
      this.editingWeeklyPlan = plan;
      this.showCreateWeeklyModal = true;
    } else {
      this.editingDailyPlan = plan;
      this.showCreateDailyModal = true;
    }
  }

  onEditFromTimetableModal(): void {
    const planner = this.selectedPlanner;
    const type = this.selectedPlannerType;
    this.closeDetailsModal();

    // Resolve back to the actual daily planner if virtual mapping was active
    if (type === 'daily') {
      const actual = this.dailyPlanners.find(p => p.id === planner.id);
      if (actual) {
        this.editPlanner(actual, 'daily');
      }
    } else {
      this.editPlanner(planner, type);
    }
  }

  // Child component save handlers
  onSplitCreated(data: any): void {
    if (data.id) {
      const index = this.splitPlanners.findIndex(p => p.id === data.id);
      if (index !== -1) {
        this.splitPlanners[index] = {
          ...this.splitPlanners[index],
          name: data.name,
          description: data.description,
          level: data.level,
          goal: data.goal,
          daysCount: data.daysCount,
          exercisesCount: data.exercisesCount,
          days: data.days
        };
        this.notification.success('Workout Split Planner template updated successfully!');
      }
    } else {
      // Create Mode
      const newPlan: SplitPlanner = {
        id: 'split-tpl-' + Date.now(),
        name: data.name,
        description: data.description,
        level: data.level,
        goal: data.goal,
        daysCount: data.daysCount,
        exercisesCount: data.exercisesCount,
        createdAt: new Date(),
        days: data.days
      };

      this.splitPlanners.unshift(newPlan);
      this.notification.success('Workout Split Planner template created successfully!');
    }
    this.saveToStorage();
    this.closeCreateSplitModal();
  }

  onWeeklyCreated(data: any): void {
    if (data.id) {
      const index = this.weeklyPlanners.findIndex(p => p.id === data.id);
      if (index !== -1) {
        this.weeklyPlanners[index] = {
          ...this.weeklyPlanners[index],
          name: data.name,
          description: data.description,
          level: data.level,
          goal: data.goal,
          activeDaysCount: data.activeDaysCount,
          calendar: data.calendar
        };
        this.notification.success('Weekly Calendar Planner template updated successfully!');
      }
    } else {
      // Create Mode
      const newWeekly: WeeklyPlanner = {
        id: 'weekly-tpl-' + Date.now(),
        name: data.name,
        description: data.description,
        level: data.level,
        goal: data.goal,
        activeDaysCount: data.activeDaysCount,
        createdAt: new Date(),
        calendar: data.calendar
      };

      this.weeklyPlanners.unshift(newWeekly);
      this.notification.success('Weekly Calendar Planner template created successfully!');
    }
    this.saveToStorage();
    this.closeCreateWeeklyModal();
  }

  onDailyCreated(data: any): void {
    if (data.id) {
      // Edit Mode
      const index = this.dailyPlanners.findIndex(p => p.id === data.id);
      if (index !== -1) {
        this.dailyPlanners[index] = {
          ...this.dailyPlanners[index],
          name: data.name,
          description: data.description,
          level: data.level,
          goal: data.goal,
          targetCategory: data.targetCategory,
          exercises: data.exercises
        };
        this.notification.success('Standalone Workout template updated successfully!');
      }
    } else {
      // Create Mode
      const newPlan: any = {
        id: 'daily-tpl-' + Date.now(),
        name: data.name,
        description: data.description,
        level: data.level,
        goal: data.goal,
        targetCategory: data.targetCategory,
        createdAt: new Date(),
        exercises: data.exercises
      };

      this.dailyPlanners.unshift(newPlan);
      this.notification.success('Standalone Workout template created successfully!');
    }
    this.saveToStorage();
    this.closeCreateDailyModal();
  }

  deletePlanner(id: string, type: 'split' | 'weekly' | 'daily', event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this workout planner template?')) {
      if (type === 'split') {
        this.splitPlanners = this.splitPlanners.filter(p => p.id !== id);
      } else if (type === 'weekly') {
        this.weeklyPlanners = this.weeklyPlanners.filter(p => p.id !== id);
      } else {
        this.dailyPlanners = this.dailyPlanners.filter(p => p.id !== id);
      }
      this.saveToStorage();
      this.notification.success('Planner template deleted.');
    }
  }

  onPlannerChanged(): void {
    if (this.selectedPlanner && this.selectedPlannerType === 'daily') {
      // Sync virtual split's exercise reorder back to the actual daily planners template
      const dailyIdx = this.dailyPlanners.findIndex(p => p.id === this.selectedPlanner.id);
      if (dailyIdx !== -1) {
        this.dailyPlanners[dailyIdx].exercises = this.selectedPlanner.days[0].exercises;
      }
    }
    this.splitPlanners = [...this.splitPlanners];
    this.weeklyPlanners = [...this.weeklyPlanners];
    this.dailyPlanners = [...this.dailyPlanners];
    this.saveToStorage();
  }
}
