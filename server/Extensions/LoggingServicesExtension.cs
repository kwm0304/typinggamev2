using Serilog;
using Serilog.Core;

namespace server.Extensions
{
    public static class LoggingServicesExtension
    {
        public static Logger ConfigureSerilog(this LoggerConfiguration loggerConfiguration, IConfiguration config)
        {
            return  new LoggerConfiguration()
            .ReadFrom.Configuration(config)
            .Enrich.FromLogContext()
            .Enrich.WithMachineName()
            .WriteTo.Console()
            .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
            .CreateLogger();
        }
    }
}
