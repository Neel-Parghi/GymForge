import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import { WorkoutMasterService } from '../../../core/services/workout-master.service';
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

  activeTab: 'workouts' | 'diets' = 'workouts';
  showCreateModal = false;
  createForm!: FormGroup;

  // Master workouts references
  categories: string[] = [];
  exercisesMap: { [category: string]: Exercise[] } = {};

  // Premium Mock Workout split templates
  workoutTemplates = [
    {
      id: 'w-temp-1',
      name: '3-Day Push-Pull-Legs (PPL)',
      description: 'The classic hypertrophy split targeting push, pull, and leg muscle groups separately for optimal recovery and growth.',
      daysCount: 3,
      level: 'Intermediate',
      goal: 'Hypertrophy',
      exercisesCount: 12,
      days: [
        {
          name: 'Push Focus',
          category: 'Chest',
          exercises: [
            { name: 'Incline Dumbbell Press', sets: 4, reps: '8-12 reps', notes: 'Focus on upper chest contraction' },
            { name: 'Barbell Bench Press', sets: 3, reps: '8-12 reps', notes: 'Touch chest lightly, drive up' },
            { name: 'Lateral Raises', sets: 4, reps: '12-15 reps', notes: 'Control the eccentric' },
            { name: 'Tricep Rope Pushdowns', sets: 3, reps: '12 reps', notes: 'Flare rope outward at bottom' }
          ]
        },
        {
          name: 'Pull Focus',
          category: 'Back',
          exercises: [
            { name: 'Pull-Ups', sets: 4, reps: 'Max reps', notes: 'Dead hang to chest-to-bar' },
            { name: 'Barbell Rows', sets: 3, reps: '8-10 reps', notes: 'Keep spine flat, pull to ribs' },
            { name: 'Face Pulls', sets: 4, reps: '15 reps', notes: 'High elbows, rotate thumbs back' },
            { name: 'Incline Dumbbell Curls', sets: 3, reps: '12 reps', notes: 'Deep stretch at bottom' }
          ]
        },
        {
          name: 'Legs Focus',
          category: 'Legs',
          exercises: [
            { name: 'Barbell Squats', sets: 4, reps: '8 reps', notes: 'Squat below parallel, brace core' },
            { name: 'Romanian Deadlifts', sets: 3, reps: '10 reps', notes: 'Hinge hips back, squeeze glutes' },
            { name: 'Leg Extensions', sets: 4, reps: '12 reps', notes: 'Peak squeeze at the top' },
            { name: 'Seated Calf Raises', sets: 4, reps: '15 reps', notes: 'Deep stretch, hold peak extension' }
          ]
        }
      ]
    },
    {
      id: 'w-temp-2',
      name: '4-Day Strength & Power Split',
      description: 'Focuses on powerlifting compound movements (Squat, Bench, Deadlift, OHP) with tactical auxiliary accessory workouts.',
      daysCount: 4,
      level: 'Advanced',
      goal: 'Strength & Power',
      exercisesCount: 16,
      days: [
        {
          name: 'Bench Press Focus',
          category: 'Chest',
          exercises: [
            { name: 'Barbell Bench Press', sets: 4, reps: '5 reps', notes: 'Heavy strength effort' },
            { name: 'Close-Grip Bench Press', sets: 3, reps: '8 reps', notes: 'Tuck elbows close' },
            { name: 'Seated Cable Rows', sets: 4, reps: '10 reps', notes: 'Squeeze shoulder blades' },
            { name: 'Chest Dips', sets: 3, reps: 'Max reps', notes: 'Leaning forward posture' }
          ]
        },
        {
          name: 'Deadlift Focus',
          category: 'Back',
          exercises: [
            { name: 'Deadlifts', sets: 4, reps: '5 reps', notes: 'Heavy pulling' },
            { name: 'Lat Pulldowns', sets: 3, reps: '10 reps', notes: 'Pull to upper chest' },
            { name: 'Dumbbell Rows', sets: 3, reps: '10 reps', notes: 'Single arm pull to hip' },
            { name: 'Plank Holds', sets: 3, reps: '60s hold', notes: 'Brace core, squeeze glutes' }
          ]
        },
        {
          name: 'Shoulders Focus',
          category: 'Shoulders',
          exercises: [
            { name: 'Standing Overhead Press', sets: 4, reps: '5 reps', notes: 'Strict overhead push' },
            { name: 'Arnold Press', sets: 3, reps: '10 reps', notes: 'Full twisting rotation' },
            { name: 'Rear Delt Flyes', sets: 4, reps: '15 reps', notes: 'Keep elbows high' },
            { name: 'Overhead Dumbbell Extensions', sets: 3, reps: '12 reps', notes: 'Tuck elbows' }
          ]
        },
        {
          name: 'Squats Focus',
          category: 'Legs',
          exercises: [
            { name: 'Barbell Squats', sets: 4, reps: '5 reps', notes: 'Heavy compound leg drive' },
            { name: 'Leg Press', sets: 3, reps: '10 reps', notes: 'Control the descent' },
            { name: 'Leg Curls', sets: 4, reps: '12 reps', notes: 'Isolate hamstrings' },
            { name: 'Standing Calf Raises', sets: 4, reps: '15 reps', notes: 'Full calf contractions' }
          ]
        }
      ]
    },
    {
      id: 'w-temp-3',
      name: 'Kettlebell Shred & Condition',
      description: 'Full-body metabolic conditioning split. Ideal for clients looking to increase stamina, burn fat, and improve core stability.',
      daysCount: 2,
      level: 'Beginner',
      goal: 'Fat Loss',
      exercisesCount: 8,
      days: [
        {
          name: 'KB Strength Focus',
          category: 'Core',
          exercises: [
            { name: 'Bulgarian Split Squats', sets: 4, reps: '12 reps', notes: 'Elevate back foot' },
            { name: 'Dumbbell Rows', sets: 3, reps: '10 reps', notes: 'Maintain flat spine' },
            { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10 reps', notes: 'Upright strict press' },
            { name: 'Plank Holds', sets: 3, reps: '60s hold', notes: 'Full body tension' }
          ]
        },
        {
          name: 'KB Cardio Power Focus',
          category: 'Cardio',
          exercises: [
            { name: 'Battle Ropes', sets: 4, reps: '20s whip', notes: 'Create constant rope waves' },
            { name: 'Push-ups', sets: 3, reps: '8 reps', notes: 'Engage core fully' },
            { name: 'Russian Twists', sets: 3, reps: '15 reps', notes: 'Side-to-side rotation' },
            { name: 'Treadmill Run', sets: 3, reps: '5 min sprint', notes: '90% HR intensity' }
          ]
        }
      ]
    }
  ];

  // Premium Mock Diet templates
  dietTemplates = [
    {
      id: 'd-temp-1',
      name: 'Lean Bulking 3000 kcal Plan',
      description: 'High-protein diet designed for clean muscle mass accrual with clean carbs, healthy fats, and minimal fat gains.',
      calories: 3000,
      macros: { protein: 180, carbs: 360, fats: 80 },
      goal: 'Muscle Gain',
      mealsCount: 5,
      meals: [
        { name: 'Breakfast (08:00 AM)', calories: 650, items: '100g Rolled Oats, 4 Egg Whites, 1 Scoop Whey, 1 Banana, 15g Almonds' },
        { name: 'Mid-Day Snack (11:30 AM)', calories: 400, items: '200g Greek Yogurt (0% Fat), 100g Berries, 30g Honey' },
        { name: 'Lunch (02:00 PM)', calories: 750, items: '150g Grilled Chicken Breast, 150g Basmati Rice, Broccoli, 1 tbsp Olive Oil' },
        { name: 'Post-Workout (06:00 PM)', calories: 500, items: '2 Scoops Hydrolyzed Whey, 75g Cream of Rice, 1 Apple' },
        { name: 'Dinner (08:30 PM)', calories: 700, items: '150g Salmon Fillet, 200g Sweet Potatoes, Asparagus' }
      ]
    },
    {
      id: 'd-temp-2',
      name: 'Keto Cut & Shred 1800 kcal',
      description: 'Ketogenic high-fat, low-carbohydrate fat loss plan tailored for rapid glycogen depletion and deep ketosis.',
      calories: 1800,
      macros: { protein: 140, carbs: 20, fats: 125 },
      goal: 'Fat Loss',
      mealsCount: 3,
      meals: [
        { name: 'Morning Fuel (09:00 AM)', calories: 550, items: '3 Whole Eggs scrambled, 2 strips Turkey Bacon, 1/2 Avocado, Coffee with 1 tbsp Butter' },
        { name: 'Keto Lunch (01:30 PM)', calories: 600, items: '150g Ribeye Steak, Large Spinach salad with Olive Oil dressing, 30g Feta Cheese' },
        { name: 'Dinner (08:00 PM)', calories: 650, items: '180g Baked Salmon, Spinach sauteed in Garlic Butter, 15g Walnuts' }
      ]
    },
    {
      id: 'd-temp-3',
      name: 'Vegetarian High Protein 2200 kcal',
      description: 'Balanced vegetarian meal guide maximizing plant-based proteins, legumes, dairy, and grains for overall wellness.',
      calories: 2200,
      macros: { protein: 130, carbs: 250, fats: 65 },
      goal: 'Maintenance',
      mealsCount: 4,
      meals: [
        { name: 'High Protein Oats (08:30 AM)', calories: 550, items: '80g Oats, 250ml Soy Milk, 1.5 Scoops Vegan Protein, 1 tbsp Peanut Butter' },
        { name: 'Lunch Bowl (01:00 PM)', calories: 650, items: '150g Grilled Paneer (or Tofu), 100g Chickpeas, 120g Quinoa, Mix Greens' },
        { name: 'Afternoon Shake (05:00 PM)', calories: 400, items: '1.5 Scoops Soy/Pea Protein, 200ml Almond Milk, 1 Banana, 10g Chia Seeds' },
        { name: 'Dinner (08:30 PM)', calories: 600, items: '150g Tofu Stir-fry with Asparagus, Bell Peppers, and 120g Brown Rice' }
      ]
    }
  ];

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

    // Reset to one row with the new category's first exercise
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
      
      const newPlan = {
        id: 'w-temp-' + (this.workoutTemplates.length + 1),
        name: val.name,
        description: val.description,
        daysCount: val.sections.length,
        level: val.level,
        goal: val.goal,
        exercisesCount: totalExs,
        days: val.sections.map((sec: any) => ({
          name: `${sec.category} Focus`,
          category: sec.category,
          exercises: sec.exercises.map((ex: any) => ({
            name: ex.exerciseName,
            sets: ex.targetSets,
            reps: ex.targetReps,
            notes: ex.notes
          }))
        }))
      };
      
      this.workoutTemplates.unshift(newPlan);
      this.notification.success('Workout template created in your library!');
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
        this.workoutTemplates = this.workoutTemplates.filter(t => t.id !== id);
      } else {
        this.dietTemplates = this.dietTemplates.filter(t => t.id !== id);
      }
      this.notification.success('Template deleted successfully.');
    }
  }
}
