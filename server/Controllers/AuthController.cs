using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models.DTOs;
using server.Models.Entities;
using server.Services.Interfaces;

namespace server.Controllers
{
    public class AuthController(
        ITokenService tokenService, UserManager<AppUser> userManager, 
        SignInManager<AppUser> signInManager, ILogger<AuthController> logger
        ) : BaseController
    {
        private readonly ITokenService _tokenService = tokenService;
        private readonly UserManager<AppUser> _userManager = userManager;
        private readonly SignInManager<AppUser> _signInManager = signInManager;
        private readonly ILogger<AuthController> _logger = logger;

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogError("Invalid login request: {LoginRequest} in method: {MethodName}", dto, nameof(Login));
                return BadRequest(ModelState);
            }
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == dto.Email.ToLower());

            if (user == null) return Unauthorized("Invalid username!");

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
            if (!result.Succeeded) 
            {
                _logger.LogError("Failed to login with SignInManager in method: {MethodName}", nameof(Login));
                return Unauthorized("Username not found and/or password incorrect"); 
            }
            
            return Ok(
                new AuthResponseDTO
                {
                    Token = _tokenService.CreateToken(user, dto.RememberMe),
                    Username = user.UserName!,
                    Email = user.Email!,
                    UserId = user.Id
                });
        }
      
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] SignupDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogError("Invalid sign up dto received: {@dto} in {MethodName}", dto, nameof(Register));
                    return BadRequest(ModelState);
                }
                var appUser = new AppUser
                {
                    UserName = dto.Username,
                    Email = dto.Email,
                    NormalizedUserName = dto.Username
                };
                var newUser = await _userManager.CreateAsync(appUser, dto.Password);
                if (newUser.Succeeded)
                {
                    return Ok(
                        new AuthResponseDTO
                        {
                            Token = _tokenService.CreateToken(appUser, false),
                            Username = appUser.UserName,
                            Email = appUser.Email,
                            UserId = appUser.Id
                        });
                }
                else
                {
                    _logger.LogError("Error registering through UserManager in {MethodName}", nameof(Register));
                    return BadRequest(newUser.Errors);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, nameof(Register));
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
