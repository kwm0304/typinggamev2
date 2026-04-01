using server.Enums;
using server.Models;
using server.Models.DTOs;

namespace server.Services.Interfaces
{
    public interface ILeaderboardService
    {
        Task<List<LeaderboardEntryDTO?>> GetLeaderboardForTimePeriod(LeaderboardTimePeriod timePeriod);
        Task<List<LeaderboardEntryDTO?>> GetUserLeaderboard(string userId);
    }
}
