namespace server.Models.DTOs
{
    /// <summary>
    /// Represents the game object at the time of the game
    /// </summary>
    public class MultiplayerGameDTO
    {
        public required MultiplayerGameConfigDTO MultiplayerGameConfig { get; set; }
        public required GameTextDTO GameText { get; set; }
        public GameConfigurationDTO GameConfig { get; set; }
        public MultiplayerGameDTO(
            MultiplayerGameConfigDTO configDTO,
            GameTextDTO gameTextDTO
            )
        {
            MultiplayerGameConfig = configDTO;
            GameText = gameTextDTO;
            GameConfig = new()
            {
                HasPunctuation = false,
                HasNumbers = false,
                IsTimed = true,
                IsWords = false,
                IsQuote = false,
                IsCustom = false,
                QuoteSize = null,
                GameTextLength = null,
                GameTimeLengthSeconds = 30
            };
        }
    }
}
