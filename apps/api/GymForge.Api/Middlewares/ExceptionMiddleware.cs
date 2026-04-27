namespace GymForge.Api.Middlewares
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                context.Response.StatusCode = 400;
                var response = new
                {
                    StatusCode = 400,
                    Message = ex.Message,
                    Success = false
                };

                await context.Response.WriteAsJsonAsync(response);
            }
        }
    }
}
