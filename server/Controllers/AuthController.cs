using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models.DTOs;
using server.Models.Entities;
using server.Services.Interfaces;

namespace server.Controllers
{
    public class AuthController(ITokenService tokenService, UserManager<AppUser> userManager, SignInManager<AppUser> signInManager) : BaseController
    {
        private readonly ITokenService _tokenService = tokenService;
        private readonly UserManager<AppUser> _userManager = userManager;
        private readonly SignInManager<AppUser> _signInManager = signInManager;

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == dto.Email.ToLower());

            if (user == null) return Unauthorized("Invalid username!");

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
            if (!result.Succeeded) return Unauthorized("Username not found and/or password incorrect");
            return Ok(
                new AuthResponse
                {
                    Token = _tokenService.CreateToken(user),
                    Username = user.UserName,
                    Email = user.Email
                });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] SignupDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var appUser = new AppUser
                {
                    UserName = dto.Username,
                    Email = dto.Email
                };
                var newUser = await _userManager.CreateAsync(appUser, dto.Password);
                if (newUser.Succeeded)
                {
                    return Ok(
                        new AuthResponse
                        {
                            Token = _tokenService.CreateToken(appUser),
                            Username = appUser.UserName,
                            Email = appUser.Email
                        });
                }
                else
                {
                    return BadRequest(newUser.Errors);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
