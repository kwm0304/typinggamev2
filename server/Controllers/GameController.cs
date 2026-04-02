using Microsoft.AspNetCore.Mvc;
using server.Services.Interfaces;
using server.Models.DTOs;
namespace server.Controllers
{
    
    public class GameController(IGameService gameService, ILogger<GameController> logger) : BaseController
    {
        private readonly IGameService _gameService = gameService;
        private readonly ILogger<GameController> _logger = logger;

        /// <summary>
        /// Gets game text from external API
        /// </summary>
        /// <returns>Game text from external API</returns>    
        /// http://localhost:5262/api/Game/create/singleplayer

        [HttpPost("create/singleplayer")]
        public async Task<ActionResult<GameTextDTO>> CreateSinglePlayerGame([FromBody] GameConfigurationDTO configDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogError("Invalid game configuration received: {@ConfigDto} in {Method}", configDto, nameof(CreateSinglePlayerGame));
                return BadRequest("Required fields are missing or misconfigured, unable to save");
            }
            GameTextDTO gameTextDTO = await _gameService.CreateGameAsync(configDto);
            return Ok(gameTextDTO);
        }
        /// <summary>
        /// returns game text with preset configuration for multiplayer game
        /// </summary>
        /// <returns>multiplayer game text</returns>
        [HttpGet("create/multiplayer")]
        public async Task<IActionResult> CreateMultilpayerGame()
        {
            var text = await _gameService.CreateMultiplayerGameAsync();
            if (text == null)
            {
                _logger.LogError("Failed to create multiplayer game, service returned null in {Method}", nameof(CreateMultilpayerGame));
                return BadRequest("Failed to create multiplayer game.");
            }
            return Ok(text);
        }

        [HttpPost("save/singleplayer")]
        public async Task<IActionResult> SaveSinglePlayer(TestResultDTO dto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogError("Invalid test result data received: {@TestResultDTO} in {Method}", dto, nameof(SaveSinglePlayer));
                return BadRequest("Required attributes missing, unable to save.");
            }
            
            string message = await _gameService.SaveSinglePlayer(dto) ?? "";
            
            if (message == "Test result saved successfully.")
            {
                return Ok();
            } 
            else
            {
                _logger.LogError("Failed to save game result, service returned message: {Message} in {Method}", message, nameof(SaveSinglePlayer));
                return BadRequest("Unable to save game");
            }
        }
        [HttpPost("save/multiplayer")]
        public async Task<IActionResult> SaveMultiplayer([FromBody] MultiplayerTestResultDTO dto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogError("Invalid object received: {@TestResult} in method: {MethodName}", dto, nameof(SaveMultiplayer));
                return BadRequest("Invalid test results");
            }
            string message = await _gameService.SaveMultiplayer(dto);
            if (message == "Test result saved successfully.")
            {
                return Ok();
            }
            else
            {
                _logger.LogError("Failed to save game result, service returned message: {Message} in {Method}", message, nameof(SaveSinglePlayer));
                return BadRequest("Unable to save game");
            }
        }

    }
}
