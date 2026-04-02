using Microsoft.AspNetCore.Mvc;
using Serilog;
using server.Data;
using server.Http;
using server.Models.DTOs;
using server.Models.Entities;
using server.Services.Interfaces;

namespace server.Services
{
    public partial class GameService(GameTextApiClient http, AppDbContext context, ILogger<GameService> logger) : IGameService
    {
        private readonly GameTextApiClient _http = http;
        private readonly AppDbContext _context = context;
        private readonly ILogger<GameService> _logger = logger;
        public async Task<GameTextDTO> CreateGameAsync(GameConfigurationDTO configDto)
        {
            CancellationToken cancellationToken = CancellationToken.None;
            int textLength = TextUtility.GetTextLengthFromConfiguration(configDto);
            string initialText = await _http.GetExternalText(textLength, cancellationToken);
            if (initialText == null) 
            { 
                _logger.LogError("Failed to retrieve initial text for game in {Method}", nameof(CreateGameAsync));
                throw new InvalidOperationException("Failed to retrieve initial text for game.");
            }
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
            if (initialText == null)
            { 
                _logger.LogError("Failed to retrieve initial text for multiplayer game in {Method}", nameof(CreateMultiplayerGameAsync));
                throw new InvalidOperationException("Failed to retrieve initial text for multiplayer game.");
            }
            string formattedText = TextUtility.ConfigureTextForGame(initialText, multiplayerConfig);
         
            return new GameTextDTO { Text = formattedText };
        }

        public async Task<string> SaveMultiplayer(MultiplayerTestResultDTO dto)
        {
            var winner = await _context.Users.FindAsync(dto.WinningTestResult.UserId);
            var loser = await _context.Users.FindAsync(dto.LosingTestResult.UserId);
            if (winner == null)
            {
                _logger.LogError("No user found with UserId: {UserId} in {Method}", dto.WinningTestResult.UserId, nameof(SaveMultiplayer));
                throw new ArgumentException("No user associated with the provided UserId.");
            }
            if (loser == null)
            {
                _logger.LogError("No user found with UserId: {UserId} in {Method}", dto.LosingTestResult.UserId, nameof(SaveMultiplayer));
                throw new ArgumentException("No user associated with the provided UserId.");
            }
            var winningResult = ConvertToTestResultFromDTO(dto.WinningTestResult, winner);
            var losingResult = ConvertToTestResultFromDTO(dto.LosingTestResult, loser);

            await _context.TestResults.AddAsync(winningResult);
            await _context.TestResults.AddAsync(losingResult);

            // Persist TestResults so their Ids are generated
            await _context.SaveChangesAsync();

            var multiplayerRes = new MultiplayerTestResult
            {
                WinningTestResultId = winningResult.Id,
                LosingTestResultId = losingResult.Id,
                WinningTestResult = winningResult,
                LosingTestResult = losingResult,
                PlayedAt = DateTime.UtcNow
            };

            await _context.MultiplayerTestResults.AddAsync(multiplayerRes);
            await _context.SaveChangesAsync();
            return "Test result saved successfully.";

        }
        private TestResult ConvertToTestResultFromDTO(TestResultDTO dto,AppUser user)
        {
            return new TestResult
            {
                UserId = user.Id,
                User = user,
                WPM = dto.WPM,
                RawWPM = dto.RawWPM,
                Accuracy = dto.Accuracy,
                TimeTaken = dto.TimeTaken,
                TestCharacters = dto.TestCharacters,
                TestType = dto.TestType,
                TestModifier = dto.TestModifier,
                PlayedAt = DateTime.UtcNow
            };
        }
        public async Task<string?> SaveSinglePlayer(TestResultDTO dto)
        {
            try
            {
                var user = await _context.Users.FindAsync(dto.UserId);
                if (user == null)
                {
                    _logger.LogError("No user found with UserId: {UserId} in {Method}", dto.UserId, nameof(SaveSinglePlayer));
                    throw new ArgumentException("No user associated with the provided UserId.");
                }
                var testResult = ConvertToTestResultFromDTO(dto, user);
                await _context.TestResults.AddAsync(testResult);
                await _context.SaveChangesAsync();
                return "Test result saved successfully.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in {Method}:", nameof(SaveSinglePlayer));
                throw;
            }
        }
    }
}
