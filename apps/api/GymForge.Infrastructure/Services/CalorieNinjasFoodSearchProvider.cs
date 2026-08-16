using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using GymForge.Application.Modules.Diet.Interfaces;
using GymForge.Contracts.DietTracking;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GymForge.Infrastructure.Services;

public class CalorieNinjasFoodSearchProvider : IFoodSearchProvider
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<CalorieNinjasFoodSearchProvider> _logger;

    public CalorieNinjasFoodSearchProvider(HttpClient httpClient, IConfiguration configuration, ILogger<CalorieNinjasFoodSearchProvider> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<FoodNutritionDto?> SearchAsync(string query)
    {
        try
        {
            var apiKey = _configuration["CalorieNinjas:ApiKey"];
            var baseUrl = _configuration["CalorieNinjas:BaseUrl"] ?? "https://api.calorieninjas.com/v1/nutrition";

            if (string.IsNullOrWhiteSpace(apiKey) || apiKey == "YOUR_CALORIENINJAS_API_KEY")
            {
                _logger.LogWarning("CalorieNinjas API Key is not configured.");
                return null;
            }

            var request = new HttpRequestMessage(HttpMethod.Get, $"{baseUrl}?query={Uri.EscapeDataString(query)}");
            request.Headers.Add("X-Api-Key", apiKey);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(content);
            var root = doc.RootElement;

            if (root.TryGetProperty("items", out var items) && items.GetArrayLength() > 0)
            {
                var item = items[0];
                return new FoodNutritionDto
                {
                    Name = item.GetProperty("name").GetString() ?? query,
                    Calories = item.GetProperty("calories").GetDouble(),
                    Protein = item.GetProperty("protein_g").GetDouble(),
                    Carbs = item.GetProperty("carbohydrates_total_g").GetDouble(),
                    Fats = item.GetProperty("fat_total_g").GetDouble()
                };
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching CalorieNinjas nutrition data for query: {Query}", query);
            return null;
        }
    }
}
