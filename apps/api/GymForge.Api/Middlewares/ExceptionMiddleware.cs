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
                var response = new
                {
                    statusCode = 500,
                    message = ex.Message,
                    success = false
                };

                await context.Response.WriteAsJsonAsync(response);
            }
        }
    }
}
