import { FormControl } from '@angular/forms';
import { AssignedMealDto, MealLogEntryDto } from '../../shared/models/diet-tracking.model';

export type MealType = 'Custom' | 'Assigned';

export interface MealForm {
  foodName: FormControl<string>;
  calories: FormControl<number>;
  protein: FormControl<number>;
  carbs: FormControl<number>;
  fats: FormControl<number>;
  sourceDietPlanMealId: FormControl<string | null>;
}

export interface PlannedMeal {
  meal: AssignedMealDto;
  entry: MealLogEntryDto | null;
  isNext: boolean;
}

export interface FoodSearchResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}
