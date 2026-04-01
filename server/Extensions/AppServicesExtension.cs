using server.Http;
using server.Services;
using server.Services.Interfaces;

namespace server.Extensions
{
    public static class AppServicesExtension
    {
        public static IServiceCollection AddAppServices(this IServiceCollection services)
        {
            services.AddScoped<IGameService, GameService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<ILeaderboardService, LeaderboardService>();
            services.AddSingleton<IMatchMakingService, MatchMakingService>();
            services.AddSingleton<GameTextApiClient>();
            return services;
        }
    }
}
