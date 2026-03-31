using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models.DTOs;
using server.Models.Entities;
using server.Services.Interfaces;
using System.Security.Claims;

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
                new AuthResponseDTO
                {
                    Token = _tokenService.CreateToken(user),
                    Username = user.UserName,
                    Email = user.Email,
                    UserId = user.Id
                });
        }
        [HttpGet("google/login")]
        public IActionResult GoogleLogin()
        {
            string provider = "Google";

            // Match the exact casing from your Google Console: /api/Auth/google/callback
            // We pass the absolute URL to ensure consistency
            var redirectUrl = "http://localhost:5262/api/Auth/google/callback";

            var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);

            // Explicitly allow the return to the callback
            return Challenge(properties, provider);
        }

        [HttpGet("google/callback")]
        public async Task<IActionResult> GoogleCallback()
        {
            // 1. Authenticate the external cookie
            var result = await HttpContext.AuthenticateAsync(IdentityConstants.ExternalScheme);

            if (!result.Succeeded)
            {
                return Unauthorized("External authentication failed or session expired (OAuth state invalid).");
            }

            var claims = result.Principal!.Claims;
            var email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

            if (string.IsNullOrEmpty(email)) return BadRequest("Email not provided by Google.");

            // 2. Check if user exists in our DB
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                // 3. Create user if they don't exist
                user = new AppUser
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true
                };

                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded) return BadRequest(createResult.Errors);
            }

            // 4. Generate our internal JWT for the Angular app
            var token = _tokenService.CreateToken(user);

            // 5. Cleanup the external cookie
            await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);

            // 6. Redirect to the Angular callback page
            return Redirect($"http://localhost:4200/auth/callback?token={token}");
        }

        [HttpGet("github/login")]
        public IActionResult Login()
        {
            return Challenge(new AuthenticationProperties
            {
                RedirectUri = "/api/Auth/github/callback"
            }, "GitHub");
        }
        [HttpGet("github/callback")]
        public async Task<IActionResult> Callback()
        {
            var result = await HttpContext.AuthenticateAsync(IdentityConstants.ExternalScheme);

            if (!result.Succeeded)
                return Unauthorized();

            var claims = result.Principal!.Claims;

            var user = new AppUser
            {
                UserName = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value,
                Email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value
            };

            var token = _tokenService.CreateToken(user);

            return Redirect($"http://localhost:4200/auth/callback?token={token}");
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
                    Email = dto.Email,
                    NormalizedUserName = dto.Username
                };
                var newUser = await _userManager.CreateAsync(appUser, dto.Password);
                if (newUser.Succeeded)
                {
                    return Ok(
                        new AuthResponseDTO
                        {
                            Token = _tokenService.CreateToken(appUser),
                            Username = appUser.UserName,
                            Email = appUser.Email,
                            UserId = appUser.Id
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
