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
            if (context.Request.Path.StartsWithSegments("/swagger"))
            {
                await _next(context);
                return;
            }

            Endpoint? endpoint = context.GetEndpoint();
            if (endpoint?.Metadata.GetMetadata<SkipResponseWrapperAttribute>() != null)
            {
                await _next(context);
                return;
            }

            Stream? originalBodyStream = context.Response.Body;

            using MemoryStream newBodyStream = new();
            context.Response.Body = newBodyStream;

            await _next(context);

            if (context.Response.StatusCode == StatusCodes.Status204NoContent || 
                context.Response.StatusCode == StatusCodes.Status304NotModified)
            {
                context.Response.Body = originalBodyStream;
                return;
            }

            newBodyStream.Seek(0, SeekOrigin.Begin);
            string? responseBody = await new StreamReader(newBodyStream).ReadToEndAsync();

            object? data = null;
            if (!string.IsNullOrWhiteSpace(responseBody))
            {
                try
                {
                    if (responseBody.TrimStart().StartsWith("{") || responseBody.TrimStart().StartsWith("["))
                    {
                        data = JsonSerializer.Deserialize<object>(responseBody);
                    }
                    else
                    {
                        data = responseBody;
                    }
                }
                catch
                {
                    data = responseBody;
                }
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
            await context.Response.WriteAsync(json);
        }
    }
}
