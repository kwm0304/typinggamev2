namespace server.Models.DTOs
{
    /// <summary>
    /// Represents the game object when the match is formed but before the game starts
    /// Contains the connection id of the player who initiated the game and the player's information
    /// </summary>
    public class MultiplayerGameConfigDTO
    {
        public string ConnectionId { get; set; } = string.Empty;
        public required MultiplayerParticipantDTO PlayerOne { get; set; }
        public required MultiplayerParticipantDTO PlayerTwo { get; set; }
    }
}
