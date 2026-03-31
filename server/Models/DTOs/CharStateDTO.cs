
using System.ComponentModel.DataAnnotations;

namespace server.Models.DTOs
{
    /// <summary>
    /// Sent from player to opposing player to as update
    /// CharState is 0 for inactive, 1 for correct, 2 for incorrect
    /// </summary>
    public class CharStateDTO
    {
        public required int Index { get; set; }
        [Range(0,2, ErrorMessage = "Number must be between 0 and 2")]
        public required int CharState { get; set; }//0: inactive 1:correct 2:incorrect
        public bool IsActive { get; set; }
    }
}
