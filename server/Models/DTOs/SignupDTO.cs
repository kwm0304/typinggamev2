using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace server.Models.DTOs
{
    public class SignupDTO
    {
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        public required string Email { get; set; }
        [Required(ErrorMessage = "Password is required.")]
        [DataType(DataType.Password)]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters long")]
        public required string Password { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        [Required(ErrorMessage = "Username is required.")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 50 characters long")]
        public required string Username { get; set; }
    }
}
