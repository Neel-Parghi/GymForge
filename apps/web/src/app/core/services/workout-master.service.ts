import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { Observable, of, shareReplay } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Exercise } from '../../shared/models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutMasterService extends BaseApiService {
  private categoriesCache$: Observable<string[]> | null = null;
  private exercisesCache$: Observable<Exercise[]> | null = null;
  private categoryExercisesCache = new Map<string, Observable<Exercise[]>>();

  // Premium Offline Fallback: a complete standard list of gym exercises with full metadata
  private readonly offlineExercises: Exercise[] = [
    {
      id: 'off-1',
      name: 'Pull-Ups',
      slug: 'pull-ups',
      category: 'Back',
      subCategory: 'Lats',
      equipment: 'Bodyweight',
      force: 'Pull',
      level: 'Intermediate',
      description: 'A classic upper body pulling exercise targeting the lats and biceps.',
      instructions: 'Hang from a bar; pull chest up to the bar; lower down slowly.'
    },
    {
      id: 'off-2',
      name: 'Lat Pulldowns',
      slug: 'lat-pulldowns',
      category: 'Back',
      subCategory: 'Lats',
      equipment: 'Cable',
      force: 'Pull',
      level: 'Beginner',
      description: 'An excellent pull-up alternative for lat isolations.',
      instructions: 'Pull bar to upper chest; squeeze shoulder blades; slowly release.'
    },
    {
      id: 'off-3',
      name: 'Barbell Rows',
      slug: 'barbell-rows',
      category: 'Back',
      subCategory: 'Upper Back',
      equipment: 'Barbell',
      force: 'Pull',
      level: 'Intermediate',
      description: 'Compound lift building back thickness.',
      instructions: 'Hinge hips; pull barbell to lower ribs; squeeze shoulder blades.'
    },
    {
      id: 'off-4',
      name: 'Dumbbell Rows',
      slug: 'dumbbell-rows',
      category: 'Back',
      subCategory: 'Lats',
      equipment: 'Dumbbell',
      force: 'Pull',
      level: 'Beginner',
      description: 'Single-arm row fixing strength imbalances.',
      instructions: 'Row dumbbell to hip; lower under control.'
    },
    {
      id: 'off-5',
      name: 'Deadlifts',
      slug: 'deadlifts',
      category: 'Back',
      subCategory: 'Lower Back',
      equipment: 'Barbell',
      force: 'Pull',
      level: 'Advanced',
      description: 'The ultimate posterior chain compound builder.',
      instructions: 'Keep back flat; drive through heels to stand upright; lock out hips.'
    },
    {
      id: 'off-6',
      name: 'Barbell Curls',
      slug: 'barbell-curls',
      category: 'Biceps',
      subCategory: 'Biceps',
      equipment: 'Barbell',
      force: 'Pull',
      level: 'Beginner',
      description: 'Classic standing arm curls for bicep mass.',
      instructions: 'Keep elbows pinned; curl bar up; extend fully.'
    },
    {
      id: 'off-7',
      name: 'Dumbbell Curls',
      slug: 'dumbbell-curls',
      category: 'Biceps',
      subCategory: 'Biceps',
      equipment: 'Dumbbell',
      force: 'Pull',
      level: 'Beginner',
      description: 'Arm curl that allows supinating wrists.',
      instructions: 'Curl weights up; supinate wrists at top; lower slowly.'
    },
    {
      id: 'off-8',
      name: 'Hammer Curls',
      slug: 'hammer-curls',
      category: 'Biceps',
      subCategory: 'Biceps',
      equipment: 'Dumbbell',
      force: 'Pull',
      level: 'Beginner',
      description: 'Arm curls targeting brachialis and thickness.',
      instructions: 'Maintain neutral grip; curl dumbbells up; lower down.'
    },
    {
      id: 'off-9',
      name: 'Flat Bench Press',
      slug: 'flat-bench-press',
      category: 'Chest',
      subCategory: 'Lower Chest',
      equipment: 'Barbell',
      force: 'Push',
      level: 'Intermediate',
      description: 'The fundamental upper body push lift.',
      instructions: 'Lower bar to chest; press up forcefully; retract shoulder blades.'
    },
    {
      id: 'off-10',
      name: 'Incline Bench Press',
      slug: 'incline-bench-press',
      category: 'Chest',
      subCategory: 'Upper Chest',
      equipment: 'Barbell',
      force: 'Push',
      level: 'Intermediate',
      description: 'Press focusing on the upper chest fibers.',
      instructions: 'Lower bar to upper chest; press back up.'
    },
    {
      id: 'off-11',
      name: 'Flat DB Press',
      slug: 'flat-db-press',
      category: 'Chest',
      subCategory: 'Lower Chest',
      equipment: 'Dumbbell',
      force: 'Push',
      level: 'Intermediate',
      description: 'Chest press allowing dynamic range of motion.',
      instructions: 'Press dumbbells straight up; lower slowly to chest sides.'
    },
    {
      id: 'off-12',
      name: 'Dips',
      slug: 'dips',
      category: 'Chest',
      subCategory: 'Lower Chest',
      equipment: 'Bodyweight',
      force: 'Push',
      level: 'Intermediate',
      description: 'High-intensity compound targeting lower chest and arms.',
      instructions: 'Lean forward slightly; lower chest down; push up to lockout.'
    },
    {
      id: 'off-13',
      name: 'Tricep Rope Pushdowns',
      slug: 'tricep-rope-pushdowns',
      category: 'Triceps',
      subCategory: 'Triceps',
      equipment: 'Cable',
      force: 'Push',
      level: 'Beginner',
      description: 'Isolates the lateral head of the triceps.',
      instructions: 'Push rope down; flare ends out; return slowly.'
    },
    {
      id: 'off-14',
      name: 'Skull Crushers',
      slug: 'skull-crushers',
      category: 'Triceps',
      subCategory: 'Triceps',
      equipment: 'Barbell',
      force: 'Push',
      level: 'Intermediate',
      description: 'EZ bar triceps isolation extension.',
      instructions: 'Lower bar to forehead; extend elbows to lockout.'
    },
    {
      id: 'off-15',
      name: 'Standing Overhead Press',
      slug: 'standing-overhead-press',
      category: 'Shoulders',
      subCategory: 'Front Delts',
      equipment: 'Barbell',
      force: 'Push',
      level: 'Advanced',
      description: 'Overhead press for building round shoulder caps.',
      instructions: 'Press bar overhead; push head forward at lockout; lower slowly.'
    },
    {
      id: 'off-16',
      name: 'Lateral Raises',
      slug: 'lateral-raises',
      category: 'Shoulders',
      subCategory: 'Side Delts',
      equipment: 'Dumbbell',
      force: 'Push',
      level: 'Beginner',
      description: 'Side dumbbell raises targeting shoulder width.',
      instructions: 'Raise arms out to sides; lead with elbows; lower slowly.'
    },
    {
      id: 'off-17',
      name: 'Barbell Squats',
      slug: 'barbell-squats',
      category: 'Legs',
      subCategory: 'Quads',
      equipment: 'Barbell',
      force: 'Push',
      level: 'Advanced',
      description: 'The absolute king of lower body strength.',
      instructions: 'Squat down until thighs are parallel; drive back up.'
    },
    {
      id: 'off-18',
      name: 'Leg Press',
      slug: 'leg-press',
      category: 'Legs',
      subCategory: 'Quads',
      equipment: 'Machine',
      force: 'Push',
      level: 'Beginner',
      description: 'Heavy quad machine pressing.',
      instructions: 'Lower platform to 90 degrees; press up forcefully.'
    },
    {
      id: 'off-19',
      name: 'Romanian Deadlifts',
      slug: 'romanian-deadlifts',
      category: 'Legs',
      subCategory: 'Hamstrings',
      equipment: 'Barbell',
      force: 'Pull',
      level: 'Intermediate',
      description: 'Posterior chain builder for hamstrings and glutes.',
      instructions: 'Hinge hips backward; lower bar to shins; stand up.'
    },
    {
      id: 'off-20',
      name: 'Plank Holds',
      slug: 'plank-holds',
      category: 'Core',
      subCategory: 'Abs',
      equipment: 'Bodyweight',
      force: 'Static',
      level: 'Beginner',
      description: 'Isometric deep core stabilizer.',
      instructions: 'Maintain straight board position on forearms and toes.'
    },
    {
      id: 'off-21',
      name: 'Treadmill Run',
      slug: 'treadmill-run',
      category: 'Cardio',
      subCategory: 'Cardio',
      equipment: 'Machine',
      force: 'Static',
      level: 'Beginner',
      description: 'Cardiovascular fat burning jog.',
      instructions: 'Walk or run on the belt to hit target heart rate.'
    }
  ];

  constructor() {
    super();
  }

  // Get list of all target muscle group categories
  getCategories(): Observable<string[]> {
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this.get<any>(API_CONSTANTS.WORKOUT_MASTER.CATEGORIES).pipe(
        map(res => res?.data || res),
        catchError(err => {
        console.warn('WorkoutMaster API offline, loading categories fallback:', err);
          const categories = Array.from(new Set(this.offlineExercises.map(e => e.category)));
          return of(categories);
        }),
        shareReplay(1)
      );
    }
    return this.categoriesCache$;
  }

  // Get full exercise list (supports searching and filtering)
  getExercises(filters?: { category?: string; equipment?: string; search?: string }): Observable<Exercise[]> {
    if (filters && (filters.category || filters.equipment || filters.search)) {
      let url = API_CONSTANTS.WORKOUT_MASTER.EXERCISES;
      const queryParams: string[] = [];

    if (filters) {
      if (filters.category) queryParams.push(`category=${encodeURIComponent(filters.category)}`);
      if (filters.equipment) queryParams.push(`equipment=${encodeURIComponent(filters.equipment)}`);
      if (filters.search) queryParams.push(`search=${encodeURIComponent(filters.search)}`);
    }

      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      return this.get<any>(url).pipe(
        map(res => res?.data || res),
        catchError(err => {
        console.warn('WorkoutMaster API offline, loading exercises fallback:', err);
          let list = [...this.offlineExercises];
        if (filters) {
          if (filters.category) {
            list = list.filter(e => e.category.toLowerCase() === filters.category!.toLowerCase());
          }
          if (filters.equipment) {
            list = list.filter(e => e.equipment.toLowerCase() === filters.equipment!.toLowerCase());
          }
          if (filters.search) {
            list = list.filter(e => e.name.toLowerCase().includes(filters.search!.toLowerCase()));
          }
        }
          return of(list);
        })
      );
    }

    if (!this.exercisesCache$) {
      this.exercisesCache$ = this.get<any>(API_CONSTANTS.WORKOUT_MASTER.EXERCISES).pipe(
        map(res => res?.data || res),
        catchError(err => {
          return of([...this.offlineExercises]);
        }),
        shareReplay(1)
      );
    }
    return this.exercisesCache$;
  }

  // Get exercise lists for a specific category
  getExercisesByCategory(category: string): Observable<Exercise[]> {
    if (!category) return of([]);
    if (!this.categoryExercisesCache.has(category)) {
      const url = API_CONSTANTS.WORKOUT_MASTER.BY_CATEGORY.replace('{category}', encodeURIComponent(category));
      const obs = this.get<any>(url).pipe(
        map(res => res?.data || res),
        catchError(err => {
        console.warn(`WorkoutMaster API offline, loading fallback for category '${category}':`, err);
          const match = this.offlineExercises.filter(
            e => e.category.toLowerCase() === category.toLowerCase()
          );
          return of(match);
        }),
        shareReplay(1)
      );
      this.categoryExercisesCache.set(category, obs);
    }
    return this.categoryExercisesCache.get(category)!;
  }

  clearCache(): void {
    this.categoriesCache$ = null;
    this.exercisesCache$ = null;
    this.categoryExercisesCache.clear();
  }
}
