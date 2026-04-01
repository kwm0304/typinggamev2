using server.Data;
using server.Enums;
using server.Models.DTOs;
using server.Services.Interfaces;
namespace server.Services
{
    public class LeaderboardService(AppDbContext context, ILogger<LeaderboardService> logger) : ILeaderboardService
    {
        private readonly AppDbContext _context = context;
        private readonly ILogger<LeaderboardService> _logger = logger;
        public async Task<List<LeaderboardEntryDTO?>> GetLeaderboardForTimePeriod(LeaderboardTimePeriod timePeriod)
        {

            DateTime startDate = timePeriod switch
            {
                LeaderboardTimePeriod.AllTime => DateTime.MinValue,
                LeaderboardTimePeriod.Weekly => DateTime.UtcNow.AddDays(-7),
                LeaderboardTimePeriod.Monthly => DateTime.UtcNow.AddMonths(-1),
                _ => throw new ArgumentOutOfRangeException(nameof(timePeriod), "Invalid time period")
            };
            try
            {
                List<LeaderboardEntryDTO?> entries = _context.TestResults
                .Where(gr => gr.PlayedAt >= startDate)
                .GroupBy(gr => gr.UserId)
                .Select(g => new LeaderboardEntryDTO
                {
                    Username = g.First().User.UserName!,
                    WPM = g.Average(gr => gr.WPM),
                    Accuracy = g.Average(gr => gr.Accuracy),
                    RawWPM = g.Average(gr => gr.RawWPM),
                    PlayedAt = g.Max(gr => gr.PlayedAt).ToString("yyyy-MM-dd HH:mm:ss")
                })
                .OrderByDescending(e => e.WPM)
                .ThenByDescending(e => e.Accuracy)
                .ThenByDescending(e => e.RawWPM)
                .Take(10)
                .Cast<LeaderboardEntryDTO?>()
                .ToList();

                return await Task.FromResult(entries);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching leaderboard for time period {TimePeriod} in method: {MethodName}", timePeriod, nameof(GetLeaderboardForTimePeriod));
                return new List<LeaderboardEntryDTO?>();
            }
        }

        public async Task<List<LeaderboardEntryDTO?>> GetUserLeaderboard(string userId)
        {
            try
            {
                List<LeaderboardEntryDTO?> entries = _context.TestResults
                                .Where(gr => gr.UserId == userId)
                                .OrderByDescending(gr => gr.PlayedAt)
                                .Select(gr => new LeaderboardEntryDTO
                                {
                                    Username = gr.User.UserName!,
                                    WPM = gr.WPM,
                                    Accuracy = gr.Accuracy,
                                    RawWPM = gr.RawWPM,
                                    PlayedAt = gr.PlayedAt.ToString("yyyy-MM-dd HH:mm:ss")
                                })
                                .Cast<LeaderboardEntryDTO?>()
                                .ToList();
                return await Task.FromResult(entries) ?? [];
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user leaderboard for userId {UserId} in method: {MethodName}", userId, nameof(GetUserLeaderboard));
                return new List<LeaderboardEntryDTO?>();

            }
        }
    }
}
