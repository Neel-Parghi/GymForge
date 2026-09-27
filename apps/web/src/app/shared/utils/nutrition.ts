/** Targets used when a member has no nutrition targets set yet. */
export const NUTRITION_TARGET_FALLBACK = { calories: 2000, protein: 150, carbs: 250, fats: 65 };

export const KCAL_PER_GRAM = { protein: 4, carbs: 4, fats: 9 };

/** Whole-number percentage of `value` against `target`, capped at 100 (0 when there is no target). */
export function percentOf(value: number, target: number): number {
  return target > 0 ? Math.min(Math.round((value / target) * 100), 100) : 0;
}

/** Share of calories coming from each macro, in whole percent. */
export function macroCalorieSplit(protein: number, carbs: number, fats: number): { protein: number; carbs: number; fats: number } {
  const p = (protein || 0) * KCAL_PER_GRAM.protein;
  const c = (carbs || 0) * KCAL_PER_GRAM.carbs;
  const f = (fats || 0) * KCAL_PER_GRAM.fats;
  const total = p + c + f;
  if (total === 0) return { protein: 0, carbs: 0, fats: 0 };
  return {
    protein: Math.round((p / total) * 100),
    carbs: Math.round((c / total) * 100),
    fats: Math.round((f / total) * 100)
  };
}
