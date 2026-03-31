using server.Models.DTOs;
using server.Models.Entities;

namespace server.Models
{
    /// <summary>
    /// Temp object used when player chooses multiplayer. 
    /// Converting to this from AuthResponseDTO, converting to AppUser or a multiplayertestresultdto at game end
    /// </summary>
    public class MultiplayerUser
    {

        public string ConnectionId { get; set; } = string.Empty;
        public required AuthResponseDTO User { get; set; }
    }
}
