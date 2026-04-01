using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Serilog;
using server.Data;
using server.Extensions;
using server.Hubs;
using server.Services;
using server.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = LoggingServicesExtension.ConfigureSerilog(new LoggerConfiguration(), builder.Configuration);
builder.Host.UseSerilog(Log.Logger);

builder.Services.AddControllers();
builder.Services.AddCors();

builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});

builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});
builder.Services.AddAppServices();
builder.Services.AddIdentityServices(builder.Configuration);
builder.Services.AddHttpServices();
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseCors(x =>
{
    x.WithOrigins("http://localhost:4200")
     .AllowAnyMethod()
     .AllowAnyHeader()
     .AllowCredentials();  
});

app.UseHttpsRedirection();
app.UseAuthentication();
app.MapControllers();
app.MapHub<GameHub>("/hubs/game");

app.Run();