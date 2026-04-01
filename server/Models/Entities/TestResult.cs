namespace server.Models.Entities
{
    public class TestResult
    {
        public int Id { get; set; }
        public required string UserId { get; set; }
        public AppUser User { get; set; } = null!;
        public required decimal RawWPM { get; set; }
        public required decimal WPM { get; set; }
        public required decimal Accuracy { get; set; }
        public required decimal TimeTaken { get; set; }
        public required TestCharacters TestCharacters { get; set; } 
        public required string TestType { get; set; }
        public required string TestModifier { get; set; }
        public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
    }
}
