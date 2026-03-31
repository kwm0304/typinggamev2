namespace server.Models.Entities
{
    public class MutltiplayerTestResult
    {
        public int Id { get; set; }
        public required int WinningTestResultId { get; set; }
        public required TestResult WinningTestResult { get; set; } 
        public required int LosingTestResultId { get; set; }
        public required TestResult LosingTestResult { get; set; }
        public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
    }
}
