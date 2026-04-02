using server.Models.Entities;

namespace server.Models.DTOs
{
    public class MultiplayerTestResultDTO
    {
        public required TestResultDTO WinningTestResult { get; set; }
        public required TestResultDTO LosingTestResult { get; set; }
    }
}
