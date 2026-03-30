namespace server.Models.DTOs
{
    public class AuthResponse
    {
        public required string Username { get; set; }
        public required string Token { get; set; }
        public required string Email { get; set; }
    }
}
