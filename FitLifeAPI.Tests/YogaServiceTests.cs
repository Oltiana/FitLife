using FitLifeAPI.DTOs.Requests;
using FitLifeAPI.Models.Entities;
using FitLifeAPI.Repositories.Interfaces;
using FitLifeAPI.Services;
using Moq;

namespace FitLifeAPI.Tests;

public class YogaServiceTests
{
    private readonly Mock<IYogaRepository> _repo = new();

    private YogaService CreateService() => new(_repo.Object);

    [Fact]
    public async Task GetClasses_TrimsImageUrl()
    {
        _repo.Setup(r => r.GetAllClasses()).ReturnsAsync(
        [
            new YogaClass
            {
                Id = 1,
                Title = "Morning Flow",
                Level = "beginner",
                DurationMin = 45,
                ImageUrl = "  /images/yoga1.jpg  ",
            },
        ]);

        var service = CreateService();
        var result = await service.GetClasses();

        Assert.Single(result);
        Assert.Equal("/images/yoga1.jpg", result[0].ImageUrl);
    }

    [Fact]
    public async Task GetClassById_ReturnsNull_WhenMissing()
    {
        _repo.Setup(r => r.GetClassById(99)).ReturnsAsync((YogaClass?)null);

        var service = CreateService();
        var result = await service.GetClassById(99);

        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateClass_Throws_WhenClassMissing()
    {
        _repo.Setup(r => r.GetClassById(4)).ReturnsAsync((YogaClass?)null);

        var service = CreateService();

        await Assert.ThrowsAsync<Exception>(() =>
            service.UpdateClass(
                4,
                new UpdateYogaClassRequest
                {
                    Title = "Updated",
                    Level = "intermediate",
                    DurationMin = 30,
                    ImageUrl = "",
                }));
    }

    [Fact]
    public async Task GetSessions_MapsToResponse()
    {
        var date = new DateTime(2026, 6, 10, 9, 0, 0, DateTimeKind.Utc);
        _repo.Setup(r => r.GetSessions()).ReturnsAsync(
        [
            new Session
            {
                Id = 7,
                StartTime = "09:00",
                Capacity = 5,
                InstructorName = "Ana",
                YogaClassId = 2,
                SessionDate = date,
            },
        ]);

        var service = CreateService();
        var result = await service.GetSessions();

        Assert.Single(result);
        Assert.Equal(7, result[0].Id);
        Assert.Equal("Ana", result[0].InstructorName);
        Assert.Equal(date, result[0].SessionDate);
    }

    [Fact]
    public async Task BookSession_CallsRepository()
    {
        _repo.Setup(r => r.BookSession(3, "Loreta")).Returns(Task.CompletedTask);

        var service = CreateService();
        await service.BookSession(3, "Loreta");

        _repo.Verify(r => r.BookSession(3, "Loreta"), Times.Once);
    }

    [Fact]
    public async Task UpdateSession_Throws_WhenSessionMissing()
    {
        _repo.Setup(r => r.GetSessionById(8)).ReturnsAsync((Session?)null);

        var service = CreateService();

        await Assert.ThrowsAsync<Exception>(() =>
            service.UpdateSession(
                8,
                new UpdateYogaSessionRequest
                {
                    StartTime = "10:00",
                    Capacity = 4,
                    Instructor = "Ben",
                    SessionDate = DateTime.UtcNow,
                }));
    }

    [Fact]
    public async Task CreateSession_PassesEntityToRepository()
    {
        Session? captured = null;
        _repo.Setup(r => r.CreateSession(It.IsAny<Session>()))
            .Callback<Session>(s => captured = s)
            .ReturnsAsync((Session s) =>
            {
                s.Id = 12;
                return s;
            });

        var service = CreateService();
        var sessionDate = new DateTime(2026, 6, 12, 0, 0, 0, DateTimeKind.Utc);
        var created = await service.CreateSession(
            new CreateYogaSessionRequest
            {
                YogaClassId = 1,
                StartTime = "18:30",
                Capacity = 8,
                Instructor = "Zoe",
                SessionDate = sessionDate,
            });

        Assert.Equal(12, created.Id);
        Assert.NotNull(captured);
        Assert.Equal(1, captured!.YogaClassId);
        Assert.Equal("Zoe", captured.InstructorName);
        Assert.Equal(sessionDate, captured.SessionDate);
    }
}
