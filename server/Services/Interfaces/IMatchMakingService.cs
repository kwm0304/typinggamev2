using server.Models;

namespace server.Services.Interfaces
{
    public interface IMatchMakingService
    {
        (MultiplayerUser playerOne, MultiplayerUser playerTwo)? TryMatch(MultiplayerUser player);
        void Remove(string connectionId);
    }
}
