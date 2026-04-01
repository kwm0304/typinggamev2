using System.ComponentModel.DataAnnotations;

namespace server.Models.DTOs
{
    public class LeaderboardEntryDTO
    {
        public int Rank { get; set; }
        [Required(ErrorMessage = "Username is required")]
        public required string Username { get; set; }

        [Required(ErrorMessage = "WPM is required")]
        public decimal WPM { get; set; }

        [Required(ErrorMessage = "Accuracy is required")]
        public decimal Accuracy { get; set; }
        [Required(ErrorMessage = "Raw WPM is required")]
        public decimal RawWPM { get; set; }
        [Required(ErrorMessage = "PlayedAt is required")]
        public required string PlayedAt { get; set; }

    }
}
