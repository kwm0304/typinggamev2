using Microsoft.AspNetCore.Mvc;
using server.Enums;
using server.Services.Interfaces;

namespace server.Controllers
{
    public class LeaderboardController(ILeaderboardService service, ILogger<LeaderboardController> logger) : BaseController
    {
        private readonly ILeaderboardService _service = service;
        private readonly ILogger<LeaderboardController> _logger = logger;

        [HttpGet("{timePeriod}")]
        public async Task<IActionResult> GetLeaderboardForTimePeriod(int timePeriod)
        {
            var timePeriosdEnum = (LeaderboardTimePeriod)timePeriod;
            var leaderboard = await _service.GetLeaderboardForTimePeriod(timePeriosdEnum);
            if (leaderboard.Count == 0)
            {
                _logger.LogInformation("No leaderboard entries found for all time.");
                return NotFound("No leaderboard entries found.");
            }
             return Ok(leaderboard);
        }

       
        [HttpGet("users/{userId}")]
        public async Task<IActionResult> GetUserLeaderboard(string userId)
        {
            var leaderboard = await _service.GetUserLeaderboard(userId);
            if (leaderboard.Count == 0)
            {
                _logger.LogInformation("No leaderboard entries found for user with ID: {UserId}.", userId);
                return NotFound($"No leaderboard entries found for user with ID: {userId}.");
            }
             return Ok(leaderboard);
        }
    }
}