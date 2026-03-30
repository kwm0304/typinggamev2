using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using server.Http;
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
        /// <param name="ct">Cancellation token</param>
        /// <returns>Game text from external API</returns>
    
        [HttpPost]
        public async Task<ActionResult<GameTextDTO>> CreateGame([FromBody] GameConfigurationDTO configDto)
        {
            try
            {
                GameTextDTO gameTextDTO = await _gameService.CreateGameAsync(configDto);
                return Ok(gameTextDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error creating game: {ex.Message}");
            }
        }

    }
}
