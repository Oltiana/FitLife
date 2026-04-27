using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FitLifeAPI.DTOs.Requests;
using FitLifeAPI.Services.Interfaces;

namespace FitLifeAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var result = await _userService.GetProfileAsync(userId);
            if (result == null)
                return NotFound("User not found");
            return Ok(result);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var result = await _userService.UpdateProfileAsync(userId, request);
            if (!result)
                return NotFound("User not found");
            return Ok("Profile updated successfully");
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
            var result = await _userService.ChangePasswordAsync(userId, request);
            if (!result)
                return BadRequest("Current password is incorrect");
            return Ok("Password changed successfully");
        }
        [HttpDelete("account")]
public async Task<IActionResult> DeleteAccount()
{
    var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
    var result = await _userService.DeleteAccountAsync(userId);
    if (!result)
        return NotFound("User not found");
    return Ok("Account deleted successfully");
}

[HttpGet("sessions")]
public async Task<IActionResult> GetActiveSessions()
{
    var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
    var sessions = await _userService.GetActiveSessionsAsync(userId);
    return Ok(sessions);
}
    }
}