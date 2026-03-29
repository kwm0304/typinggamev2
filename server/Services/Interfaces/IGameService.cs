using server.Models.DTOs;

namespace server.Services.Interfaces
{
    public interface IGameService
    {
        int GetTextLengthFromConfiguration(GameConfigurationDTO dto);
        string ConfigureTextForGame(string gameText, GameConfigurationDTO config);
        Task<GameTextDTO> CreateGameAsync(GameConfigurationDTO config);
    }
}
