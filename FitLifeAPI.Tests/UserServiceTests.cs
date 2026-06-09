using FitLifeAPI.DTOs.Requests;
using FitLifeAPI.Models.Entities;
using FitLifeAPI.Repositories.Interfaces;
using FitLifeAPI.Services;
using Moq;

namespace FitLifeAPI.Tests;

public class UserServiceTests
{
    private readonly Mock<IAuthRepository> _repo = new();

    private UserService CreateService() => new(_repo.Object);

    private static User SampleUser(int id = 1) => new()
    {
        Id = id,
        FullName = $"Test User {id}",
        Email = $"user{id}@test.com",
        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
        IsVerified = true,
        Role = "User",
        CreatedAt = DateTime.UtcNow,
    };

    // ── GetProfileAsync ──────────────────────────────────────────────────────

    [Fact]
    public async Task GetProfileAsync_ValidId_ReturnsProfile()
    {
        _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(SampleUser(1));

        var service = CreateService();
        var result = await service.GetProfileAsync(1);

        Assert.NotNull(result);
        Assert.Equal(1, result!.Id);
        Assert.Equal("user1@test.com", result.Email);
        Assert.True(result.IsVerified);
    }

    [Fact]
    public async Task GetProfileAsync_InvalidId_ReturnsNull()
    {
        _repo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((User?)null);

        var service = CreateService();
        var result = await service.GetProfileAsync(999);

        Assert.Null(result);
    }

    // ── UpdateProfileAsync ───────────────────────────────────────────────────

    [Fact]
    public async Task UpdateProfileAsync_ExistingUser_ReturnsTrue()
    {
        _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(SampleUser(1));
        _repo.Setup(r => r.UpdateAsync(It.IsAny<User>())).Returns(Task.CompletedTask);

        var service = CreateService();
        var result = await service.UpdateProfileAsync(1, new UpdateProfileRequest
        {
            FullName = "Updated Name",
        });

        Assert.True(result);
        _repo.Verify(r => r.UpdateAsync(
            It.Is<User>(u => u.FullName == "Updated Name")),
            Times.Once);
    }

    [Fact]
    public async Task UpdateProfileAsync_NonExistingUser_ReturnsFalse()
    {
        _repo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((User?)null);

        var service = CreateService();
        var result = await service.UpdateProfileAsync(999, new UpdateProfileRequest { FullName = "X" });

        Assert.False(result);
        _repo.Verify(r => r.UpdateAsync(It.IsAny<User>()), Times.Never);
    }

    // ── ChangePasswordAsync ──────────────────────────────────────────────────

    [Fact]
    public async Task ChangePasswordAsync_CorrectCurrentPassword_ReturnsTrue()
    {
        _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(SampleUser(1));
        _repo.Setup(r => r.UpdateAsync(It.IsAny<User>())).Returns(Task.CompletedTask);

        var service = CreateService();
        var result = await service.ChangePasswordAsync(1, new ChangePasswordRequest
        {
            CurrentPassword = "Password123!",
            NewPassword = "NewPassword456!",
        });

        Assert.True(result);
        _repo.Verify(r => r.UpdateAsync(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task ChangePasswordAsync_WrongCurrentPassword_ReturnsFalse()
    {
        _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(SampleUser(1));

        var service = CreateService();
        var result = await service.ChangePasswordAsync(1, new ChangePasswordRequest
        {
            CurrentPassword = "WrongPassword!",
            NewPassword = "NewPassword456!",
        });

        Assert.False(result);
        _repo.Verify(r => r.UpdateAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task ChangePasswordAsync_NonExistingUser_ReturnsFalse()
    {
        _repo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((User?)null);

        var service = CreateService();
        var result = await service.ChangePasswordAsync(999, new ChangePasswordRequest
        {
            CurrentPassword = "Password123!",
            NewPassword = "NewPassword456!",
        });

        Assert.False(result);
    }

    // ── DeleteAccountAsync ───────────────────────────────────────────────────

    [Fact]
    public async Task DeleteAccountAsync_ExistingUser_ReturnsTrue()
    {
        _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(SampleUser(1));
        _repo.Setup(r => r.DeleteAsync(1)).Returns(Task.CompletedTask);

        var service = CreateService();
        var result = await service.DeleteAccountAsync(1);

        Assert.True(result);
        _repo.Verify(r => r.DeleteAsync(1), Times.Once);
    }

    [Fact]
    public async Task DeleteAccountAsync_NonExistingUser_ReturnsFalse()
    {
        _repo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((User?)null);

        var service = CreateService();
        var result = await service.DeleteAccountAsync(999);

        Assert.False(result);
        _repo.Verify(r => r.DeleteAsync(It.IsAny<int>()), Times.Never);
    }

    // ── GetActiveSessionsAsync ───────────────────────────────────────────────

    [Fact]
    public async Task GetActiveSessionsAsync_ReturnsMappedSessions()
    {
        var tokens = new List<RefreshToken>
        {
            new() { Id = 1, UserId = 1, Token = "token1", CreatedAt = DateTime.UtcNow, ExpiresAt = DateTime.UtcNow.AddDays(7) },
            new() { Id = 2, UserId = 1, Token = "token2", CreatedAt = DateTime.UtcNow, ExpiresAt = DateTime.UtcNow.AddDays(3) },
        };

        _repo.Setup(r => r.GetActiveSessionsAsync(1)).ReturnsAsync(tokens);

        var service = CreateService();
        var result = await service.GetActiveSessionsAsync(1);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetActiveSessionsAsync_NoSessions_ReturnsEmpty()
    {
        _repo.Setup(r => r.GetActiveSessionsAsync(99)).ReturnsAsync([]);

        var service = CreateService();
        var result = await service.GetActiveSessionsAsync(99);

        Assert.Empty(result);
    }
}