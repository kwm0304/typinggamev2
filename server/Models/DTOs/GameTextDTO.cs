namespace server.Models.DTOs
{
    /// <summary>
    /// Sent in response to CreateGame and CreateMultiplayerGame, contains the text for the game
    /// </summary>
    public class GameTextDTO
    {
        public required string Text { get; set; }
    }
}
