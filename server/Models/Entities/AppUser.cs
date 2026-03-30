using Microsoft.AspNetCore.Identity;

namespace server.Models.Entities
{
    public class AppUser : IdentityUser
    {
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
            public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
