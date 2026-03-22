using GymForge.Shared.Models;
using System.Text.Json;

namespace GymForge.Api.Middlewares
{
    public class ResponseWrapperMiddleware
    {

        private readonly RequestDelegate _next;

        public ResponseWrapperMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Skip swagger endpoints
            if (context.Request.Path.StartsWithSegments("/swagger"))
            {
                await _next(context);
                return;
            }

            Stream? originalBodyStream = context.Response.Body;

            using var newBodyStream = new MemoryStream();
            context.Response.Body = newBodyStream;

            await _next(context);

            newBodyStream.Seek(0, SeekOrigin.Begin);

            var responseBody = await new StreamReader(newBodyStream).ReadToEndAsync();

            object? data = null;

            if (!string.IsNullOrWhiteSpace(responseBody))
            {
                data = JsonSerializer.Deserialize<object>(responseBody);
            }
            
            ApiResponse<object> wrappedResponse = new()
            {
                Success = context.Response.StatusCode < 400,
                StatusCode = context.Response.StatusCode,
                Data = context.Response.StatusCode < 400 ? data : null,
                Error = context.Response.StatusCode >= 400 ? data : null,
                Message = context.Response.StatusCode < 400 ? "Request successful" : "Request failed",
                Timestamp = DateTime.UtcNow
            };

            string json = JsonSerializer.Serialize(wrappedResponse);

            context.Response.Body = originalBodyStream;

            if (context.Response.StatusCode != StatusCodes.Status304NotModified)
            {
                await context.Response.WriteAsync(json);
            }
        }
    }
}
