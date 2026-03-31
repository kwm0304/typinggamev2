using System.ComponentModel.DataAnnotations;

namespace server.Models
{
    /// <summary>
    /// Used to track the number of correct, incorrect, extra, and missed characters during the game
    /// Part of TestResult and MultiplayerTestResult
    /// </summary>
    public class TestCharacters
    {
        [Required(ErrorMessage = "Correct character count is required")]
        public int Correct { get; set; }
        [Required(ErrorMessage = "Incorrect character count is required")]
        public int Incorrect { get; set; }
        [Required(ErrorMessage = "Extra character count is required")]
        public int Extra { get; set; }
        [Required(ErrorMessage = "Missed character count is required")]
        public int Missed { get; set; }
    }
}
