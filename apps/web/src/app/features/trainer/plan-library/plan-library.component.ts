import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import { WorkoutMasterService } from '../../../core/services/workout-master.service';
import { WorkoutPlanService } from '../../../core/services/workout-plan.service';
import { Exercise } from '../../../shared/models/exercise.model';

@Component({
  selector: 'app-plan-library',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './plan-library.component.html',
  styleUrl: './plan-library.component.scss'
})
export class PlanLibraryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private workoutMasterService = inject(WorkoutMasterService);
  private workoutPlanService = inject(WorkoutPlanService);

  activeTab: 'workouts' | 'diets' = 'workouts';
  showCreateModal = false;
  createForm!: FormGroup;

  // Master workouts references
  categories: string[] = [];
  exercisesMap: { [category: string]: Exercise[] } = {};

  // Workout templates loaded from backend API
  workoutTemplates: any[] = [];

  // Diet templates (empty as no backend diet API currently exists)
  dietTemplates: any[] = [];

  ngOnInit(): void {
    // Fetch categorized standard gym reference databases from master endpoint
    this.workoutMasterService.getCategories().subscribe(cats => {
      this.categories = cats;
    });
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

    this.loadWorkoutPlans();
  }

  loadWorkoutPlans(): void {
    this.workoutPlanService.getPlans(undefined, true).subscribe({
      next: (plans) => {
        this.workoutTemplates = (plans || []).map(plan => {
          return {
            id: plan.id,
            name: plan.name,
            description: plan.description,
            level: plan.level,
            goal: plan.goal,
            daysCount: plan.daysCount,
            exercisesCount: plan.exercisesCount,
            days: plan.type === 'Split' ? (plan as any).days : []
          };
        });
      },
      error: (err) => {
        console.error('Failed to load templates:', err);
      }
    });
  }

  setTab(tab: 'workouts' | 'diets'): void {
    this.activeTab = tab;
    this.initForm();
  }

  // Helper helpers for rich UI templates
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

  getMealTime(name: string): string {
    if (!name) return 'Flexible';
    const match = name.match(/\(([^)]+)\)/);
    return match ? match[1] : '08:00 AM';
  }

  getMealTitle(name: string): string {
    if (!name) return 'Meal';
    return name.replace(/\s*\([^)]+\)/, '').trim();
  }

  getMacroPercentage(diet: any, macro: 'protein' | 'carbs' | 'fats'): number {
    if (!diet || !diet.calories) return 0;
    const val = diet.macros[macro] || 0;
    const factor = macro === 'fats' ? 9 : 4;
    const percentage = ((val * factor) / diet.calories) * 100;
    return Math.min(100, Math.max(0, Math.round(percentage)));
  }

  // Getters for nested reactive FormArrays
  get sections(): FormArray {
    return this.createForm.get('sections') as FormArray;
  }

  getExercises(sectionIndex: number): FormArray {
    return this.sections.at(sectionIndex).get('exercises') as FormArray;
  }

  private initForm(): void {
    if (this.activeTab === 'workouts') {
      this.createForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required]],
        level: ['Beginner'],
        goal: ['Hypertrophy'],
        sections: this.fb.array([])
      });
      // Start with one muscle group section by default
      this.addSection();
    } else {
      this.createForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['', [Validators.required]],
        calories: [2000, [Validators.required, Validators.min(800), Validators.max(6000)]],
        protein: [150, [Validators.required]],
        carbs: [200, [Validators.required]],
        fats: [70, [Validators.required]],
        goal: ['Fat Loss']
      });
    }
  }

  // Dynamic builder operations
  addSection(): void {
    const defaultCategory = this.categories[0] || 'Back';
    const sectionGroup = this.fb.group({
      category: [defaultCategory, [Validators.required]],
      exercises: this.fb.array([])
    });

    this.sections.push(sectionGroup);
    const newSectionIndex = this.sections.length - 1;

    // Monitor muscle group category changes to set appropriate default exercises inside
    sectionGroup.get('category')?.valueChanges.subscribe(() => {
      this.resetExercisesForSection(newSectionIndex);
    });

    // Populate initial exercise row in the new section
    this.addExercise(newSectionIndex);
  }

  removeSection(index: number): void {
    if (this.sections.length > 1) {
      this.sections.removeAt(index);
    } else {
      this.notification.warning('A workout plan must contain at least one muscle group section.');
    }
  }

  addExercise(sectionIndex: number): void {
    const section = this.sections.at(sectionIndex);
    const category = section.get('category')?.value || 'Back';
    const availableExercises = this.getExercisesForCategory(category);

    const exerciseGroup = this.fb.group({
      exerciseName: [availableExercises[0]?.name || '', [Validators.required]],
      targetSets: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
      targetReps: ['10-12 reps', [Validators.required]],
      notes: ['']
    });

    this.getExercises(sectionIndex).push(exerciseGroup);
  }

  removeExercise(sectionIndex: number, exerciseIndex: number): void {
    const exercisesArray = this.getExercises(sectionIndex);
    if (exercisesArray.length > 1) {
      exercisesArray.removeAt(exerciseIndex);
    } else {
      this.notification.warning('Each section must contain at least one exercise.');
    }
  }

  private resetExercisesForSection(sectionIndex: number): void {
    const section = this.sections.at(sectionIndex);
    const category = section.get('category')?.value || 'Back';
    const exercisesArray = this.getExercises(sectionIndex);
    const available = this.getExercisesForCategory(category);

    while (exercisesArray.length > 0) {
      exercisesArray.removeAt(0);
    }

    const firstGroup = this.fb.group({
      exerciseName: [available[0]?.name || '', [Validators.required]],
      targetSets: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
      targetReps: ['10-12 reps', [Validators.required]],
      notes: ['']
    });
    exercisesArray.push(firstGroup);
  }

  getExercisesForCategory(category: string): Exercise[] {
    if (!category) return [];
    if (this.exercisesMap[category]) {
      return this.exercisesMap[category];
    }
    const key = Object.keys(this.exercisesMap).find(k => k.toLowerCase() === category.toLowerCase());
    return key ? this.exercisesMap[key] : [];
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.initForm();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const val = this.createForm.getRawValue();
    if (this.activeTab === 'workouts') {
      const totalExs = val.sections.reduce((sum: number, s: any) => sum + s.exercises.length, 0);

      const newPlan: any = {
        name: val.name,
        description: val.description,
        type: 'Split',
        level: val.level,
        goal: val.goal,
        isCustom: false,
        daysCount: val.sections.length,
        exercisesCount: totalExs,
        days: val.sections.map((sec: any, secIdx: number) => ({
          dayName: `${sec.category} Focus`,
          dayIndex: secIdx + 1,
          isRestDay: false,
          category: sec.category,
          exercises: sec.exercises.map((ex: any, exIdx: number) => ({
            exerciseName: ex.exerciseName,
            sets: ex.targetSets,
            reps: ex.targetReps,
            notes: ex.notes,
            sortOrder: exIdx
          }))
        }))
      };

      this.workoutPlanService.createPlan(newPlan).subscribe({
        next: () => {
          this.notification.success('Workout template created in your library!');
          this.loadWorkoutPlans();
        },
        error: (err) => {
          this.notification.error('Failed to create workout plan.');
        }
      });
    } else {
      const newDiet = {
        id: 'd-temp-' + (this.dietTemplates.length + 1),
        name: val.name,
        description: val.description,
        calories: val.calories,
        macros: { protein: val.protein, carbs: val.carbs, fats: val.fats },
        goal: val.goal,
        mealsCount: 3,
        meals: [
          { name: 'Breakfast', calories: Math.round(val.calories * 0.3), items: 'Unassigned meal items' },
          { name: 'Lunch', calories: Math.round(val.calories * 0.4), items: 'Unassigned meal items' },
          { name: 'Dinner', calories: Math.round(val.calories * 0.3), items: 'Unassigned meal items' }
        ]
      };
      this.dietTemplates.unshift(newDiet);
      this.notification.success('Diet template created in your library!');
    }

    this.closeCreateModal();
  }

  deleteTemplate(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this plan template?')) {
      if (this.activeTab === 'workouts') {
        this.workoutPlanService.deletePlan(id).subscribe({
          next: () => {
            this.notification.success('Template deleted successfully.');
            this.loadWorkoutPlans();
          },
          error: (err) => {
            console.error('Failed to delete plan:', err);
            this.notification.error('Failed to delete workout template.');
          }
        });
      } else {
        this.dietTemplates = this.dietTemplates.filter(t => t.id !== id);
        this.notification.success('Template deleted successfully.');
      }
    }
  }
}
