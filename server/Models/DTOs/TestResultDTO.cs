using System.ComponentModel.DataAnnotations;

namespace server.Models.DTOs
{
    /// <summary>
    /// Sent from player to server at the end of a game
    /// </summary>
    public class TestResultDTO
    {
        [Required(ErrorMessage = "UserId is required")]
        public required string UserId { get; set; }
        [Required(ErrorMessage = "Raw WPM is required")]
        [Range(0, double.MaxValue, ErrorMessage = "Raw WPM must be a non-negative number")]
        public required decimal RawWPM { get; set; }
        [Required(ErrorMessage = "Accuracy is required")]
        [Range(0, double.MaxValue, ErrorMessage = "Accuracy must be between 0 and 100")]
        public required decimal Accuracy { get; set; }
        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Time taken must be a non-negative number")]
        public required decimal TimeTaken { get; set; }
        [Required(ErrorMessage = "Test characters are required")]
        public required TestCharacters TestCharacters { get; set; }
        [Required(ErrorMessage = "Test type is required")]
        [RegularExpression("^(words|time|quote|custom)$",
        ErrorMessage = "Test type must be one of: words, time, quote, custom")]
        public required string TestType { get; set; }
        [Required(ErrorMessage = "Test modifier is required")]
        public required string TestModifier { get; set; }
    }
}
