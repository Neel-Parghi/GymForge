using GymForge.Application.Modules.Diet.Interface;
using GymForge.Application.Modules.PlanGeneration.Interface;
using GymForge.Application.Modules.Workout.Interface;
using GymForge.Contracts.DietPlan;
using GymForge.Contracts.PlanGeneration;
using GymForge.Contracts.Workout;
using GymForge.Contracts.WorkoutPlan;
using Microsoft.Extensions.Logging;

namespace GymForge.Application.Modules.PlanGeneration.Services
{
    public class PlanGenerationService : IPlanGenerationService
    {
        private readonly IWorkoutService _workoutService;
        private readonly IWorkoutPlanService _workoutPlanService;
        private readonly IMemberWorkoutService _memberWorkoutService;
        private readonly IDietPlanService _dietPlanService;
        private readonly IMemberDietService _memberDietService;
        private readonly ILogger<PlanGenerationService> _logger;

        private static readonly Dictionary<int, (string DayName, string[] Categories)[]> DaySplits = new()
        {
            [3] = new[]
            {
                ("Day 1 - Push (Chest, Shoulders & Triceps)", new[] { "Chest", "Shoulders", "Triceps" }),
                ("Day 2 - Pull (Back & Biceps)", new[] { "Back", "Biceps" }),
                ("Day 3 - Legs & Core", new[] { "Legs", "Core" })
            },
            [4] = new[]
            {
                ("Day 1 - Upper Body", new[] { "Chest", "Back", "Shoulders" }),
                ("Day 2 - Lower Body & Core", new[] { "Legs", "Core" }),
                ("Day 3 - Push (Chest, Shoulders & Triceps)", new[] { "Chest", "Shoulders", "Triceps" }),
                ("Day 4 - Pull (Back & Biceps)", new[] { "Back", "Biceps" })
            },
            [5] = new[]
            {
                ("Day 1 - Chest & Triceps", new[] { "Chest", "Triceps" }),
                ("Day 2 - Back & Biceps", new[] { "Back", "Biceps" }),
                ("Day 3 - Legs", new[] { "Legs" }),
                ("Day 4 - Shoulders & Core", new[] { "Shoulders", "Core" }),
                ("Day 5 - Conditioning", new[] { "Cardio", "Core" })
            }
        };

        public PlanGenerationService(
            IWorkoutService workoutService,
            IWorkoutPlanService workoutPlanService,
            IMemberWorkoutService memberWorkoutService,
            IDietPlanService dietPlanService,
            IMemberDietService memberDietService,
            ILogger<PlanGenerationService> logger)
        {
            _workoutService = workoutService;
            _workoutPlanService = workoutPlanService;
            _memberWorkoutService = memberWorkoutService;
            _dietPlanService = dietPlanService;
            _memberDietService = memberDietService;
            _logger = logger;
        }

        public async Task<StarterPlanResultDto> GenerateStarterPlansAsync(Guid userId, string primaryGoal, string? experienceLevel, decimal heightCm, decimal weightKg, DateTime dob, string gender)
        {
            string goal = NormalizeGoal(primaryGoal);
            string level = NormalizeLevel(experienceLevel);
            int age = CalculateAge(dob);

            MacroResult macros = CalculateMacros(heightCm, weightKg, age, gender, goal);

            try
            {
                CreateWorkoutPlanRequest workoutRequest = await BuildWorkoutPlanAsync(level, goal);
                if (workoutRequest.Days.Any(d => d.Exercises.Count > 0))
                {
                    WorkoutPlanDto workoutPlan = await _workoutPlanService.CreatePlanAsync(workoutRequest, null, userId);
                    await _memberWorkoutService.AssignPlanToMemberAsync(userId, workoutPlan.Id, null);
                }
                else
                {
                    _logger.LogWarning("Skipped starter workout plan generation for user {UserId}: no master exercises available.", userId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate starter workout plan for user {UserId}.", userId);
            }

            try
            {
                CreateDietPlanRequest dietRequest = BuildDietPlan(goal, macros);
                DietPlanDto dietPlan = await _dietPlanService.CreatePlanAsync(dietRequest, null, userId);
                await _memberDietService.AssignDietToMemberAsync(userId, dietPlan.Id, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate starter diet plan for user {UserId}.", userId);
            }

            return new StarterPlanResultDto
            {
                TargetCalories = macros.Calories,
                TargetProtein = (int)Math.Round(macros.ProteinGrams),
                TargetCarbs = (int)Math.Round(macros.CarbGrams),
                TargetFats = (int)Math.Round(macros.FatGrams)
            };
        }

        private async Task<CreateWorkoutPlanRequest> BuildWorkoutPlanAsync(string level, string goal)
        {
            int dayCount = level switch
            {
                "Advanced" => 5,
                "Intermediate" => 4,
                _ => 3
            };

            (string DayName, string[] Categories)[] template = DaySplits[dayCount];
            (int Sets, string Reps) setsReps = GetSetsReps(goal);

            List<CreateWorkoutPlanDayDto> days = new();
            for (int i = 0; i < template.Length; i++)
            {
                (string dayName, string[] categories) = template[i];
                days.Add(await BuildDayAsync(dayName, i, categories, level, setsReps));
            }

            return new CreateWorkoutPlanRequest
            {
                Name = $"{level} Starter Program",
                Description = $"Auto-generated {dayCount}-day split based on your onboarding profile.",
                Level = level,
                Goal = MapGoalToWorkoutGoal(goal),
                Type = "Split",
                IsCustom = true,
                Days = days
            };
        }

        private async Task<CreateWorkoutPlanDayDto> BuildDayAsync(string dayName, int dayIndex, string[] categories, string level, (int Sets, string Reps) setsReps)
        {
            List<CreateWorkoutPlanExerciseDto> exercises = new();
            int perCategoryCount = categories.Length <= 2 ? 3 : 2;
            int sortOrder = 0;

            foreach (string category in categories)
            {
                List<ExerciseDto> categoryExercises = await _workoutService.GetExercisesAsync(category, null, null);
                List<ExerciseDto> levelMatched = categoryExercises
                    .Where(e => string.Equals(e.Level, level, StringComparison.OrdinalIgnoreCase))
                    .ToList();
                List<ExerciseDto> pool = levelMatched.Count > 0 ? levelMatched : categoryExercises;

                foreach (ExerciseDto exercise in pool.OrderBy(e => e.Name).Take(perCategoryCount))
                {
                    exercises.Add(new CreateWorkoutPlanExerciseDto
                    {
                        ExerciseId = exercise.Id,
                        ExerciseName = exercise.Name,
                        Sets = setsReps.Sets,
                        Reps = setsReps.Reps,
                        SortOrder = sortOrder++
                    });
                }
            }

            return new CreateWorkoutPlanDayDto
            {
                DayName = dayName,
                DayIndex = dayIndex,
                IsRestDay = false,
                Category = string.Join(" & ", categories),
                Exercises = exercises
            };
        }

        private static CreateDietPlanRequest BuildDietPlan(string goal, MacroResult macros)
        {
            List<CreateDietPlanMealDto> meals = new()
            {
                BuildMeal("Breakfast", "08:00 AM", 0.25m, macros),
                BuildMeal("Lunch", "01:00 PM", 0.35m, macros),
                BuildMeal("Evening Snack", "05:00 PM", 0.10m, macros),
                BuildMeal("Dinner", "08:00 PM", 0.30m, macros)
            };

            return new CreateDietPlanRequest
            {
                Name = $"{ToTitleCase(goal)} Starter Plan",
                Description = "Auto-generated based on your onboarding profile.",
                Protein = macros.ProteinGrams,
                Carbs = macros.CarbGrams,
                Fats = macros.FatGrams,
                Goal = MapGoalToDietGoal(goal),
                IsCustom = true,
                IsTemplate = false,
                Meals = meals
            };
        }

        private static CreateDietPlanMealDto BuildMeal(string name, string time, decimal share, MacroResult macros)
        {
            return new CreateDietPlanMealDto
            {
                Name = name,
                Time = time,
                Calories = (int)Math.Round(macros.Calories * share),
                Protein = Math.Round(macros.ProteinGrams * share, 1),
                Items = SuggestItems(name),
                SortOrder = 0
            };
        }

        private static string SuggestItems(string mealName) => mealName switch
        {
            "Breakfast" => "Oats or eggs, whole-grain toast, a serving of fruit",
            "Lunch" => "Grilled chicken, paneer or tofu, brown rice or roti, mixed vegetables",
            "Evening Snack" => "Greek yogurt or a protein shake, a handful of nuts",
            "Dinner" => "Grilled fish, chicken or legumes, salad, sweet potato or quinoa",
            _ => "Balanced meal with lean protein, complex carbs, and vegetables"
        };

        private static (int Sets, string Reps) GetSetsReps(string goal) => goal switch
        {
            "muscle_gain" => (4, "8-10"),
            "weight_loss" => (3, "12-15"),
            "endurance" => (3, "15-20"),
            _ => (3, "10-12")
        };

        private static string MapGoalToWorkoutGoal(string goal) => goal switch
        {
            "muscle_gain" => "Hypertrophy",
            "weight_loss" => "Fat Loss",
            "endurance" => "Endurance",
            "flexibility" => "Mobility",
            _ => "General Fitness"
        };

        private static string MapGoalToDietGoal(string goal) => goal switch
        {
            "muscle_gain" => "Muscle Gain",
            "weight_loss" => "Weight Loss",
            "endurance" => "Endurance",
            "flexibility" => "Maintenance",
            _ => "Maintenance"
        };

        private static string NormalizeGoal(string? goal)
        {
            if (string.IsNullOrWhiteSpace(goal)) return "general_fitness";
            return goal.Trim().ToLowerInvariant();
        }

        private static string NormalizeLevel(string? level)
        {
            if (string.IsNullOrWhiteSpace(level)) return "Beginner";
            return level.Trim().ToLowerInvariant() switch
            {
                "intermediate" => "Intermediate",
                "advanced" => "Advanced",
                _ => "Beginner"
            };
        }

        private static string ToTitleCase(string goal)
        {
            string spaced = goal.Replace('_', ' ');
            return string.Join(' ', spaced.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Select(w => char.ToUpperInvariant(w[0]) + w[1..]));
        }

        private static int CalculateAge(DateTime dob)
        {
            DateTime today = DateTime.UtcNow.Date;
            int age = today.Year - dob.Year;
            if (dob.Date > today.AddYears(-age)) age--;
            return Math.Max(age, 0);
        }

        private static MacroResult CalculateMacros(decimal heightCm, decimal weightKg, int age, string gender, string goal)
        {
            double h = (double)heightCm;
            double w = (double)weightKg;

            double bmr = gender.Equals("Male", StringComparison.OrdinalIgnoreCase)
                ? (10 * w) + (6.25 * h) - (5 * age) + 5
                : gender.Equals("Female", StringComparison.OrdinalIgnoreCase)
                    ? (10 * w) + (6.25 * h) - (5 * age) - 161
                    : (10 * w) + (6.25 * h) - (5 * age) - 78;

            // Assumes moderate activity (factor 1.55) since onboarding doesn't capture activity level.
            double tdee = bmr * 1.55;

            double targetCalories = goal switch
            {
                "weight_loss" => Math.Max(tdee - 500, bmr),
                "muscle_gain" => tdee + 300,
                _ => tdee
            };

            double proteinFactor = goal switch
            {
                "muscle_gain" => 2.2,
                "weight_loss" => 2.0,
                "endurance" => 1.6,
                _ => 1.8
            };

            double proteinGrams = w * proteinFactor;
            double proteinKcal = proteinGrams * 4;
            double fatKcal = targetCalories * 0.25;
            double fatGrams = fatKcal / 9;
            double carbKcal = Math.Max(targetCalories - proteinKcal - fatKcal, 0);
            double carbGrams = carbKcal / 4;

            return new MacroResult(
                (int)Math.Round(targetCalories),
                Math.Round((decimal)proteinGrams, 1),
                Math.Round((decimal)carbGrams, 1),
                Math.Round((decimal)fatGrams, 1)
            );
        }

        private record MacroResult(int Calories, decimal ProteinGrams, decimal CarbGrams, decimal FatGrams);
    }
}
