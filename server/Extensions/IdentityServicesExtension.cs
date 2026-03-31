using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using server.Data;
using server.Models.Entities;

namespace server.Extensions
{
    public static class IdentityServicesExtension
    {
        public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration config)
        {
            services.AddIdentity<AppUser, IdentityRole>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequiredLength = 12;
            })
            .AddEntityFrameworkStores<AppDbContext>();
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme =
                options.DefaultChallengeScheme =
                options.DefaultForbidScheme =
                options.DefaultScheme =
                options.DefaultSignInScheme =
                options.DefaultSignOutScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = config["JWT:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = config["JWT:Audience"],
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        System.Text.Encoding.UTF8.GetBytes(config["JWT:Key"]!)
                    )
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;

                        if (!string.IsNullOrEmpty(accessToken) &&
                            path.StartsWithSegments("/hubs/game"))
                        {
                            context.Token = accessToken;
                        }

                        return Task.CompletedTask;
                    }
                };
            });
            return services;
        }
    }
}
