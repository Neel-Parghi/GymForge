import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { MemberService } from '../../../core/services/member.service';
import { forkJoin } from 'rxjs';

interface DailyRoutineItem {
  id: string;
  title: string;
  time?: string;
  amount?: string;
  icon: string;
  color: string;
  completed: boolean;
  isEditing?: boolean;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit {
  private authService = inject(AuthApiService);
  private memberService = inject(MemberService);

  showProfileAlert = false;
  userId: string = '';
  userName = 'Member';
  greeting = 'Good morning';
  greetingTheme = 'theme-morning';

  // Data
  todayWorkoutName: string | null = null;
  workoutStreak = 0;
  caloriesBurnedThisWeek = 0;
  targetCalories = 2500;
  isEditingCalories = false;
  activePlanName = 'No active plan';

  // Routine
  dailyRoutines: DailyRoutineItem[] = [];
  newRoutineTitle = '';
  isAddingRoutine = false;
  
  private routineStorageKey = 'gymforge_daily_routine';
  private routineDateKey = 'gymforge_daily_routine_date';
  private calorieTargetKey = 'gymforge_calorie_target';

  ngOnInit() {
    this.authService.userProfile$.subscribe(profile => {
      if (profile) {
        this.userName = profile.firstName || 'Member';
        this.userId = profile.id;
        this.checkProfileCompletion(profile);
        this.loadDashboardData();
      }
    });

    this.setGreeting();
    this.loadRoutine();
    this.loadCalorieTarget();
  }

  private checkProfileCompletion(profile: any) {
    // Show alert if no gymId or incomplete details and not dismissed
    const dismissed = localStorage.getItem('gymforge_profile_banner_dismissed');
    if (!dismissed) {
      this.showProfileAlert = true; // In a real app we might check profile fields
    }
  }

  dismissProfileAlert() {
    this.showProfileAlert = false;
    localStorage.setItem('gymforge_profile_banner_dismissed', 'true');
  }

  setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good morning';
      this.greetingTheme = 'theme-morning';
    } else if (hour < 18) {
      this.greeting = 'Good afternoon';
      this.greetingTheme = 'theme-afternoon';
    } else {
      this.greeting = 'Good evening';
      this.greetingTheme = 'theme-evening';
    }
  }

  loadDashboardData() {
    if (!this.userId) return;

    forkJoin({
      plan: this.memberService.getActivePlan(this.userId),
      logs: this.memberService.getWorkoutLogs(this.userId)
    }).subscribe(({ plan, logs }) => {
      // 1. Process Active Plan
      if (plan.data && plan.data.dietPlan) {
        // Handle if needed
      }
      
      // Let's assume plan assignment might contain workout plan info or use a different endpoint if needed.
      // For now, if getActivePlan returns the member's plan assignments:
      // Since getActivePlan is somewhat ambiguous, let's just set some defaults if not found.
      // But typically we find active split here. For now let's leave it simple.
      
      // Actually, let's use getPlanAssignments to get active workout plan.
      this.memberService.getPlanAssignments(this.userId).subscribe(assignmentsRes => {
        const assignments = assignmentsRes.data || [];
        const activeAssignment = assignments.slice(-1)[0];
        
        if (activeAssignment && activeAssignment.workoutPlan) {
           this.activePlanName = activeAssignment.workoutPlan.name;
           this.determineTodayWorkout(activeAssignment);
        } else {
           this.todayWorkoutName = 'Rest Day';
        }
      });

      // 2. Process Logs for Streak and Calories
      const allLogs = logs.data || [];
      this.calculateStreak(allLogs);
      this.calculateWeeklyCalories(allLogs);
    });
  }

  private determineTodayWorkout(assignment: any) {
    const today = new Date().getDay();
    const daysName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = daysName[today];

    const customDays = assignment.customScheduleDays || [];
    const customDay = customDays.find((d: any) => d.dayOfWeek === todayName);
    
    if (customDay) {
       if (customDay.isRestDay) {
         this.todayWorkoutName = 'Rest Day';
         return;
       }
       if (customDay.workoutPlanDayId) {
         const planDay = assignment.workoutPlan?.days?.find((d: any) => d.id === customDay.workoutPlanDayId);
         if (planDay) {
            this.todayWorkoutName = planDay.dayName || planDay.category || 'Workout';
            return;
         }
       }
    }
    
    // Fallback to template days
    if (assignment.workoutPlan && assignment.workoutPlan.days) {
      const templateDay = assignment.workoutPlan.days.find((d: any) => d.dayName && d.dayName.toLowerCase().includes(todayName.toLowerCase()));
      if (templateDay) {
        this.todayWorkoutName = templateDay.isRestDay ? 'Rest Day' : (templateDay.category || templateDay.dayName);
      } else {
        this.todayWorkoutName = 'Rest Day';
      }
    }
  }

  private calculateStreak(logs: any[]) {
    // Simple streak calculation based on dates
    if (!logs || logs.length === 0) {
      this.workoutStreak = 0;
      return;
    }

    const dates = logs
      .filter(l => l.status === 'Completed' || l.status === 'RestDay')
      .map(l => new Date(l.date).setHours(0,0,0,0))
      .sort((a, b) => b - a);

    if (dates.length === 0) return;

    let streak = 0;
    let currentDate = new Date().setHours(0,0,0,0);
    
    // Check if today is logged
    if (dates[0] === currentDate) {
      streak = 1;
      currentDate -= 86400000; // previous day
      for (let i = 1; i < dates.length; i++) {
        if (dates[i] === currentDate) {
          streak++;
          currentDate -= 86400000;
        } else if (dates[i] < currentDate) {
          break;
        }
      }
    } else if (dates[0] === currentDate - 86400000) {
      // yesterday logged
      streak = 1;
      currentDate -= 172800000;
      for (let i = 1; i < dates.length; i++) {
        if (dates[i] === currentDate) {
          streak++;
          currentDate -= 86400000;
        } else if (dates[i] < currentDate) {
          break;
        }
      }
    }

    this.workoutStreak = streak;
  }

  private calculateWeeklyCalories(logs: any[]) {
    // Calculate for the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyLogs = logs.filter(l => new Date(l.date) >= oneWeekAgo && l.status === 'Completed');
    
    let estimatedCalories = 0;
    weeklyLogs.forEach(log => {
      // Estimate: 50 kcal per completed exercise
      const completedExercises = (log.loggedExercises || []).filter((ex: any) => 
         (ex.loggedSets || []).some((s: any) => s.completed)
      ).length;
      
      // Rough estimate if no exercises are detailed but log is completed
      if (completedExercises === 0) {
        estimatedCalories += 300; 
      } else {
        estimatedCalories += (completedExercises * 50);
      }
    });

    this.caloriesBurnedThisWeek = estimatedCalories;
  }

  // --- Calorie Ring SVG Calculations ---
  get caloriePercentage(): number {
    if (this.targetCalories === 0) return 0;
    return Math.min((this.caloriesBurnedThisWeek / this.targetCalories) * 100, 100);
  }

  get ringCircumference(): number {
    return 2 * Math.PI * 60; // r=60
  }

  get ringOffset(): number {
    const pct = this.caloriePercentage;
    return this.ringCircumference - (pct / 100) * this.ringCircumference;
  }

  loadCalorieTarget() {
    const saved = localStorage.getItem(this.calorieTargetKey);
    if (saved) {
      this.targetCalories = parseInt(saved, 10);
    }
  }

  saveCalorieTarget() {
    localStorage.setItem(this.calorieTargetKey, this.targetCalories.toString());
    this.isEditingCalories = false;
  }

  // --- Daily Routine Tracker ---
  loadRoutine() {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem(this.routineDateKey);
    const savedRoutine = localStorage.getItem(this.routineStorageKey);

    const defaultRoutine: DailyRoutineItem[] = [
      { id: '1', title: 'Wake Up', time: '6:00 AM', icon: 'fa-sun', color: '#f59e0b', completed: false },
      { id: '2', title: 'Drink Water', amount: '3L', icon: 'fa-glass-water', color: '#0ea5e9', completed: false },
      { id: '3', title: 'Breakfast', icon: 'fa-bread-slice', color: '#d97706', completed: false },
      { id: '4', title: 'Protein Shake', icon: 'fa-blender', color: '#6366f1', completed: false },
      { id: '5', title: 'Workout', icon: 'fa-dumbbell', color: '#8b5cf6', completed: false },
      { id: '6', title: 'Sleep', time: '10:00 PM', icon: 'fa-moon', color: '#4f46e5', completed: false }
    ];

    if (savedDate !== today || !savedRoutine) {
      // Reset for new day or initialize
      this.dailyRoutines = savedRoutine ? JSON.parse(savedRoutine).map((r: any) => ({...r, completed: false})) : defaultRoutine;
      localStorage.setItem(this.routineDateKey, today);
      this.saveRoutine();
    } else {
      this.dailyRoutines = JSON.parse(savedRoutine);
    }
  }

  saveRoutine() {
    localStorage.setItem(this.routineStorageKey, JSON.stringify(this.dailyRoutines));
  }

  toggleRoutine(item: DailyRoutineItem) {
    item.completed = !item.completed;
    this.saveRoutine();
  }

  addRoutine() {
    if (!this.newRoutineTitle.trim()) return;
    this.dailyRoutines.push({
      id: Date.now().toString(),
      title: this.newRoutineTitle.trim(),
      icon: 'fa-check-circle',
      color: '#10b981',
      completed: false
    });
    this.newRoutineTitle = '';
    this.isAddingRoutine = false;
    this.saveRoutine();
  }

  removeRoutine(item: DailyRoutineItem) {
    this.dailyRoutines = this.dailyRoutines.filter(r => r.id !== item.id);
    this.saveRoutine();
  }
}

