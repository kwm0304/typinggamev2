using server.Services;
using server.Services.Interfaces;

namespace server.Extensions
{
    public static class AppServicesExtension
    {
        public static IServiceCollection AddAppServices(this IServiceCollection services)
        {
            services.AddScoped<IGameService, GameService>();
            services.AddScoped<IResultService, ResultService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddSingleton<IMatchMakingService, MatchMakingService>();
            return services;
        }
    }
}
