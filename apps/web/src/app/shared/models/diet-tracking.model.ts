export interface DietLogDto {
  id: string;
  memberId: string;
  logDate: string;

  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;

  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;

  mealEntries: MealLogEntryDto[];
  assignedMeals: AssignedMealDto[];
}

export interface MealLogEntryDto {
  id: string;
  mealType: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  sourceDietPlanMealId?: string;
}

export interface AssignedMealDto {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  items: string;
}

export interface AddMealEntryRequestDto {
  logDate: string;
  mealType: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  sourceDietPlanMealId?: string;
}

export interface DietLogSummaryDto {
  logDate: string;
  targetCalories: number;
  totalCalories: number;
  targetProtein: number;
  totalProtein: number;
  targetCarbs: number;
  totalCarbs: number;
  targetFats: number;
  totalFats: number;
}
