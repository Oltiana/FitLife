using Microsoft.AspNetCore.Mvc;
using FitLifeAPI.DTOs.Requests;
using FitLifeAPI.Services.Interfaces;

namespace FitLifeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            try
            {
                var response = await _authService.RegisterAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            try
            {
                var response = await _authService.LoginAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
[HttpPost("refresh-token")]  // ✚ shto
        public async Task<IActionResult> RefreshToken([FromBody] string refreshToken)
        {
            var result = await _authService.RefreshTokenAsync(refreshToken);
            if (result == null)
                return Unauthorized("Refresh token invalid ose skaduar.");

            return Ok(result);
        }

        [HttpPost("verify-email")]
public async Task<IActionResult> VerifyEmail([FromBody] string token)
{
    var result = await _authService.VerifyEmailAsync(token);
    if (!result)
        return BadRequest("Invalid or expired token");
    return Ok("Email verified successfully");
}

[HttpPost("reset-password")]
public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
{
    var result = await _authService.ResetPasswordAsync(request.Token, request.NewPassword);
    if (!result)
        return BadRequest("Invalid or expired token");
    return Ok("Password reset successfully");
}
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
        {
            var result = await _authService.ForgotPasswordAsync(request.Email);
            return Ok("If email exists, reset link has been sent");
        }

    }
}