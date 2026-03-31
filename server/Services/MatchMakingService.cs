using server.Models;
using server.Services.Interfaces;

namespace server.Services
{
    public class MatchMakingService : IMatchMakingService
    {
        private readonly Queue<MultiplayerUser> _playersInLobby = new();
        private readonly HashSet<string> _connectionIds = [];
        private readonly Lock _lock = new();

        public (MultiplayerUser playerOne, MultiplayerUser playerTwo)? TryMatch(MultiplayerUser player)
        {
            lock (_lock)
            {
                if (_connectionIds.Contains(player.ConnectionId))
                    return null;
                if (_playersInLobby.Count > 0)
                {
                    var opponent = _playersInLobby.Dequeue();
                    _connectionIds.Remove(opponent.ConnectionId);
                    return (opponent, player);
                }
                _playersInLobby.Enqueue(player);
                _connectionIds.Add(player.ConnectionId);
                return null;
            }
        }
        public void Remove(string connectionId)
        {
            lock (_lock)
            {
                _connectionIds.Remove(connectionId);
                var remaining = _playersInLobby
                    .Where(p => p.ConnectionId != connectionId).ToList();
                _playersInLobby.Clear();
                foreach (var player in remaining)
                {
                    _playersInLobby.Enqueue(player);
                }
            }

        }
    }
}
