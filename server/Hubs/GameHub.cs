using Microsoft.AspNetCore.SignalR;
using server.Models;
using server.Models.DTOs;
using server.Services.Interfaces;
using System.Security.Claims;

namespace server.Hubs
{
 
    public class GameHub(IMatchMakingService matchMakingService) : Hub
    {
        private readonly IMatchMakingService _matchMakingService = matchMakingService;
        public override async Task OnConnectedAsync()
        {
            var context = Context.GetHttpContext();
            await base.OnConnectedAsync();
        }
        public async Task FindMatch()
        {
            var username = Context.User?.Identity?.Name
                           ?? Context.User?.FindFirst(ClaimTypes.Name)?.Value
                           ?? Context.User?.FindFirst("name")?.Value;

            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            Console.WriteLine($"FindMatch called. Username={username}, UserId={userId}");

            if (string.IsNullOrWhiteSpace(username))
                throw new HubException("User is not authenticated.");


            var player = new MultiplayerUser
            {
                User = new AuthResponseDTO
                {
                    Email = Context.User?.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty,
                    UserId = userId,
                    Username = username
                },
                ConnectionId = Context.ConnectionId
            };

            var result = _matchMakingService.TryMatch(player);

            if (result is null)
            {
                await Clients.Caller.SendAsync("WaitingForMatch");
                return;
            }

            var (p1, p2) = result.Value;
            var gameId = Guid.NewGuid().ToString();

            await Groups.AddToGroupAsync(p1.ConnectionId, gameId);
            await Groups.AddToGroupAsync(p2.ConnectionId, gameId);

            var game = new MultiplayerGameConfigDTO
            {
                ConnectionId = p1.ConnectionId,
                PlayerOne = new MultiplayerParticipantDTO
                {
                    UserId = p1.User.UserId,
                    Username = p1.User.Username
                },
                PlayerTwo = new MultiplayerParticipantDTO
                {
                    UserId = p2.User.UserId,
                    Username = p2.User.Username
                }
            };

            await Clients.Clients(p1.ConnectionId, p2.ConnectionId)
                .SendAsync("MatchFound", new { gameId, game });
        }


        public async Task SendGameTextOnLoad(string groupName, string user, string message)
        {
            //send gameText to both players in the game group
            await Clients.Group(groupName).SendAsync("ReceiveMessage", user, message);
        }

        public async Task SendVisibleTextUpdate(string gameId, string visibleText)
        {
            await Clients.OthersInGroup(gameId).SendAsync("ReceiveVisibleTextUpdate", visibleText);
        }

        // Send to a opponent
        public async Task SendGameUpdate(string gameId, CharStateDTO update)
        {
            await Clients.OthersInGroup(gameId).SendAsync("ReceiveUpdate", update);
        }
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        
    }
}
