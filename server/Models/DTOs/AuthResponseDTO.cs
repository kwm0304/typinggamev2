namespace server.Models.DTOs
{
    /// <summary>
    /// Sent as a response for Register and Login.
    /// Used as a parameter for Multiplayer which is why Token isn't required by default
    /// </summary>
    public class AuthResponseDTO
    {
        public required string Username { get; set; }
        public required string UserId { get; set; }
        public  string Token { get; set; } = string.Empty;
        public required string Email { get; set; }
    }
}
