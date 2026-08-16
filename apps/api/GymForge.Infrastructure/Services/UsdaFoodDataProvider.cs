using System;
using System.Globalization;
using System.Net.Http;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using GymForge.Application.Modules.Diet.Interfaces;
using GymForge.Contracts.DietTracking;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GymForge.Infrastructure.Services;

public class UsdaFoodDataProvider : IFoodSearchProvider
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<UsdaFoodDataProvider> _logger;

    // USDA nutrient IDs are stable across all food records — used instead of matching by name.
    private const int EnergyKcalNutrientId = 1008;
    private const int ProteinNutrientId = 1003;
    private const int CarbohydrateNutrientId = 1005;
    private const int FatNutrientId = 1004;

    private const string GramUnitAlternation = "kilograms|kilogram|kgs|kg|grams|gram|gms|gm|g";

    // "200g rice" / "200gm rice" style — quantity before the food name.
    private static readonly Regex QuantityFirstPattern = new(
        $@"^(\d+(?:\.\d+)?)\s*({GramUnitAlternation})\b\s+(.+)$",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    // "rice 200g" / "paneer 200gm" style — quantity after the food name.
    private static readonly Regex QuantityLastPattern = new(
        $@"^(.+?)\s+(\d+(?:\.\d+)?)\s*({GramUnitAlternation})$",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public UsdaFoodDataProvider(HttpClient httpClient, IConfiguration configuration, ILogger<UsdaFoodDataProvider> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<FoodNutritionDto?> SearchAsync(string query)
    {
        try
        {
            var apiKey = _configuration["UsdaFoodData:ApiKey"];
            var baseUrl = _configuration["UsdaFoodData:BaseUrl"] ?? "https://api.nal.usda.gov/fdc/v1";

            if (string.IsNullOrWhiteSpace(apiKey) || apiKey == "YOUR_USDA_API_KEY")
            {
                _logger.LogWarning("USDA FoodData Central API key is not configured.");
                return null;
            }

            (string foodName, double? gramsMultiplier) = ParseGramQuantity(query);

            // Tier 1: curated reference data — best match quality for generic/common foods
            // (a query for "apple" shouldn't return a specific snack-brand SKU).
            var match = await FindBestMatchAsync(foodName, "&dataType=Foundation&dataType=SR%20Legacy&dataType=Survey%20%28FNDDS%29", apiKey, baseUrl);

            // Tier 2: Branded — many ethnic/regional foods (e.g. paneer, dal, ghee) have no entry
            // anywhere in USDA's curated datasets, but do show up here via imported-brand nutrition
            // labels (e.g. Haldiram's, Deep Foods) registered for the US market.
            if (match == null)
            {
                match = await FindBestMatchAsync(foodName, "&dataType=Branded", apiKey, baseUrl);
            }

            if (match == null)
            {
                return null;
            }

            var (name, calories, protein, carbs, fats) = match.Value;

            // USDA returns nutrients per 100g; scale up/down when the query specified a gram quantity.
            double multiplier = gramsMultiplier ?? 1.0;

            return new FoodNutritionDto
            {
                Name = gramsMultiplier.HasValue ? $"{query.Trim()} ({name})" : name,
                Calories = Math.Round(calories * multiplier, 1),
                Protein = Math.Round(protein * multiplier, 1),
                Carbs = Math.Round(carbs * multiplier, 1),
                Fats = Math.Round(fats * multiplier, 1)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching USDA FoodData Central nutrition data for query: {Query}", query);
            return null;
        }
    }

    private async Task<(string Name, double Calories, double Protein, double Carbs, double Fats)?> FindBestMatchAsync(
        string foodName, string dataTypeFilter, string apiKey, string baseUrl)
    {
        // Fetch a handful of candidates rather than trusting USDA's top relevance hit blindly — its
        // ranking often surfaces a composite dish (e.g. "Palak Paneer") ahead of the plain ingredient
        // ("Paneer, cheese") for a bare ingredient query, which understates the true macros.
        var url = $"{baseUrl}/foods/search?query={Uri.EscapeDataString(foodName)}&pageSize=5{dataTypeFilter}&api_key={apiKey}";
        var response = await GetWithRetryAsync(url);

        if (response == null)
        {
            return null;
        }

        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);
        var root = doc.RootElement;

        if (!root.TryGetProperty("foods", out var foods) || foods.GetArrayLength() == 0)
        {
            return null;
        }

        var food = SelectBestMatch(foods, foodName);
        var name = food.TryGetProperty("description", out var descEl) ? descEl.GetString() ?? foodName : foodName;

        double calories = 0, protein = 0, carbs = 0, fats = 0;

        if (food.TryGetProperty("foodNutrients", out var nutrients))
        {
            foreach (var nutrient in nutrients.EnumerateArray())
            {
                if (!nutrient.TryGetProperty("nutrientId", out var idEl))
                    continue;

                double value = nutrient.TryGetProperty("value", out var valEl) ? valEl.GetDouble() : 0;

                switch (idEl.GetInt32())
                {
                    case EnergyKcalNutrientId: calories = value; break;
                    case ProteinNutrientId: protein = value; break;
                    case CarbohydrateNutrientId: carbs = value; break;
                    case FatNutrientId: fats = value; break;
                }
            }
        }

        return (name, calories, protein, carbs, fats);
    }

    /// <summary>
    /// USDA's edge occasionally 400s a well-formed request (observed live: ~20-50% of identical requests
    /// failing transiently, seemingly load-balancer/backend related rather than anything about the request
    /// itself). Retries a few times before giving up rather than treating one flaky response as "no match".
    /// </summary>
    private async Task<HttpResponseMessage?> GetWithRetryAsync(string url, int maxAttempts = 3)
    {
        for (int attempt = 1; attempt <= maxAttempts; attempt++)
        {
            HttpResponseMessage response = await _httpClient.GetAsync(url);

            if (response.IsSuccessStatusCode)
            {
                return response;
            }

            response.Dispose();

            if (attempt < maxAttempts)
            {
                _logger.LogWarning("USDA FoodData Central request failed (attempt {Attempt}/{MaxAttempts}, status {Status}), retrying.",
                    attempt, maxAttempts, response.StatusCode);
                await Task.Delay(TimeSpan.FromMilliseconds(300 * attempt));
            }
            else
            {
                _logger.LogWarning("USDA FoodData Central request failed after {MaxAttempts} attempts (status {Status}).",
                    maxAttempts, response.StatusCode);
            }
        }

        return null;
    }

    /// <summary>
    /// Picks the most literal ingredient match out of a handful of candidates instead of just taking
    /// USDA's top relevance hit. Scored in tiers so a decisive category (exact match, "Query, ..." prefix)
    /// always wins over a weaker one (query merely appearing somewhere in a longer dish name), with USDA's
    /// own ranking only used to break ties within the same tier.
    /// </summary>
    private static JsonElement SelectBestMatch(JsonElement foods, string query)
    {
        string normalizedQuery = query.Trim().ToLowerInvariant();
        JsonElement best = foods[0];
        int bestScore = int.MinValue;
        int index = 0;

        foreach (var candidate in foods.EnumerateArray())
        {
            string description = candidate.TryGetProperty("description", out var descEl) ? descEl.GetString() ?? "" : "";
            int score = (ScoreDescriptionMatch(description.ToLowerInvariant(), normalizedQuery) * 10) - index;

            if (score > bestScore)
            {
                bestScore = score;
                best = candidate;
            }

            index++;
        }

        return best;
    }

    private static int ScoreDescriptionMatch(string normalizedDescription, string normalizedQuery)
    {
        if (normalizedDescription == normalizedQuery)
        {
            return 1000;
        }

        // USDA descriptions commonly follow a comma-separated "Ingredient, descriptor, descriptor"
        // convention, and the ingredient itself can land in either position (e.g. "Paneer, cheese" vs
        // "Cheese, paneer" are both plain-ingredient entries). A description where the query is one of
        // those exact comma-separated segments is almost certainly the ingredient itself, not a dish
        // that merely mentions it — checked regardless of which segment position it's in.
        foreach (string segment in normalizedDescription.Split(','))
        {
            if (segment.Trim() == normalizedQuery)
            {
                return 600;
            }
        }

        if (Regex.IsMatch(normalizedDescription, $@"\b{Regex.Escape(normalizedQuery)}\b"))
        {
            return Math.Max(100 - normalizedDescription.Length, 10);
        }

        return 0;
    }

    /// <summary>
    /// USDA's search endpoint does no natural-language quantity parsing (unlike CalorieNinjas) — it always
    /// returns nutrients per 100g. A gram/kg quantity is stripped from the query before searching, whether
    /// it comes before ("200g rice") or after ("rice 200g", "paneer 200gm") the food name, and used to scale
    /// the per-100g result afterward. Count-based quantities ("2 eggs", "1 apple") aren't scaled — the
    /// per-100g value is returned as-is.
    /// </summary>
    private static (string FoodName, double? GramsMultiplier) ParseGramQuantity(string query)
    {
        string trimmed = query.Trim();

        var match = QuantityFirstPattern.Match(trimmed);
        if (match.Success)
        {
            return BuildQuantityResult(match.Groups[1].Value, match.Groups[2].Value, match.Groups[3].Value);
        }

        match = QuantityLastPattern.Match(trimmed);
        if (match.Success)
        {
            return BuildQuantityResult(match.Groups[2].Value, match.Groups[3].Value, match.Groups[1].Value);
        }

        return (trimmed, null);
    }

    private static (string FoodName, double? GramsMultiplier) BuildQuantityResult(string amountStr, string unit, string foodName)
    {
        double amount = double.Parse(amountStr, CultureInfo.InvariantCulture);
        bool isKilo = unit.StartsWith("kg", StringComparison.OrdinalIgnoreCase) || unit.StartsWith("kilo", StringComparison.OrdinalIgnoreCase);
        double grams = isKilo ? amount * 1000 : amount;

        return (foodName.Trim(), grams / 100.0);
    }
}
