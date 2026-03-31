using Microsoft.AspNetCore.Mvc;
using server.Services.Interfaces;
using server.Models.DTOs;
namespace server.Controllers
{
    
    public class GameController(IGameService gameService) : BaseController
    {
        private readonly IGameService _gameService = gameService;

        /// <summary>
        /// Gets game text from external API
        /// </summary>
        /// <returns>Game text from external API</returns>    
        [HttpPost]
        public async Task<ActionResult<GameTextDTO>> CreateGame([FromBody] GameConfigurationDTO configDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest("Required fields are missing or misconfigured, unable to save");
                }
                GameTextDTO gameTextDTO = await _gameService.CreateGameAsync(configDto);
                return Ok(gameTextDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating game: {ex.Message}");
            }
        }
        /// <summary>
        /// returns game text with preset configuration for multiplayer game
        /// </summary>
        /// <returns>multiplayer game text</returns>
        [HttpGet]
        public async Task<IActionResult> CreateMultilpayerGame()
        {
            try
            {
                var text = await _gameService.CreateMultiplayerGameAsync();
                if (text == null)
                {
                    return BadRequest("Failed to create multiplayer game.");
                }
                return Ok(text);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating game: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> SaveSinglePlayer(TestResultDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest("Required attributes missing, unable to save.");
                }
                int res = await _gameService.SaveSinglePlayer(dto);
                if (res > 0)
                {
                    return Ok();
                } 
                else
                {
                    return BadRequest("Unable to save game");
                }
            }
            catch(Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}
