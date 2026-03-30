using Microsoft.AspNetCore.SignalR;

namespace server.Hubs
{
    public class GameHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var context = Context.GetHttpContext();

        }
    }
}
