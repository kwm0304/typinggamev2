using server.Http;

namespace server.Extensions
{
    public static class HttpServicesExtension
    {
        public static IServiceCollection AddHttpServices(this IServiceCollection services)
        {
            services.AddHttpClient<GameTextApiClient>(client =>
            {
                client.BaseAddress = new Uri("https://baconipsum.com/");
                client.DefaultRequestHeaders.Accept.Add(
                    new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
                client.Timeout = TimeSpan.FromSeconds(10);
            });
            return services;
        }
    }
}
