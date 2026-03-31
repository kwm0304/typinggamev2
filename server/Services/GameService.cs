using server.Data;
using server.Http;
using server.Models.DTOs;
using server.Services.Interfaces;

namespace server.Services
{
    public partial class GameService(GameTextApiClient http, AppDbContext context) : IGameService
    {
        private readonly GameTextApiClient _http = http;
        private readonly AppDbContext _context = context;

        public async Task<GameTextDTO> CreateGameAsync(GameConfigurationDTO configDto)
        {
            CancellationToken cancellationToken = CancellationToken.None;
            int textLength = TextUtility.GetTextLengthFromConfiguration(configDto);
            string initialText = await _http.GetExternalText(textLength, cancellationToken);
            string formattedText = TextUtility.ConfigureTextForGame(initialText, configDto);
            if (configDto.IsWords == true)
            {
                formattedText = TextUtility.GetExactLength(formattedText, Convert.ToInt32(configDto.GameTextLength));
            }
            return new GameTextDTO { Text = formattedText };
        }
        public async Task<GameTextDTO> CreateMultiplayerGameAsync()
        {
            var multiplayerConfig = new GameConfigurationDTO
            {
                IsQuote = false,
                IsTimed = true,
                IsWords = false,
                HasPunctuation = false,
                HasNumbers = false,
                GameTimeLengthSeconds = 30
            };
            CancellationToken cancellationToken = CancellationToken.None;
            int textLength = TextUtility.GetTextLengthFromConfiguration(multiplayerConfig);
            string initialText = await _http.GetExternalText(textLength, cancellationToken);
            string formattedText = TextUtility.ConfigureTextForGame(initialText, multiplayerConfig);
         
            return new GameTextDTO { Text = formattedText };
        }

        public Task<int> SaveSinglePlayer(TestResultDTO dto)
        {
            throw new NotImplementedException();
        }
    }
}
