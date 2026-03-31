using server.Models.DTOs;

namespace server.Services.Interfaces
{
    public interface IGameService
    {
        Task<GameTextDTO> CreateGameAsync(GameConfigurationDTO config);
        Task<GameTextDTO> CreateMultiplayerGameAsync();
        Task<int> SaveSinglePlayer(TestResultDTO dto);
    }
}
