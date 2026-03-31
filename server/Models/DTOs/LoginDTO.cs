using System.ComponentModel.DataAnnotations;

namespace server.Models.DTOs
{
    public class LoginDTO
    {
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        public required string Email { get; set; }
        [Required(ErrorMessage = "Password is required.")]
        [DataType(DataType.Password)]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters long")]
        public required string Password { get; set; }
    }
}
