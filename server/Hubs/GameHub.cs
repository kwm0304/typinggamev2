using Microsoft.AspNetCore.SignalR;

namespace server.Hubs
{
    public class GameHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var context = Context.GetHttpContext();
            // You can use 'context' here if needed (e.g., query string, auth, etc.)
            await base.OnConnectedAsync();
        }

        // Broadcast to everyone
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        // Send to a specific group
        public async Task SendGroupMessage(string groupName, string user, string message)
        {
            await Clients.Group(groupName).SendAsync("ReceiveMessage", user, message);
        }

        // Send to a specific connection (individual)
        public async Task SendMessageToIndividual(string connectionId, string user, string message)
        {
            await Clients.Client(connectionId).SendAsync("ReceiveMessage", user, message);
        }
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        // Optional: helper for leaving a group
        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }
    }
}
