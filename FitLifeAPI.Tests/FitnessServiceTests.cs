using FitLifeAPI.DTOs.Requests;
using FitLifeAPI.Models.Entities;
using FitLifeAPI.Repositories.Interfaces;
using FitLifeAPI.Services;
using Moq;

namespace FitLifeAPI.Tests;

public class FitnessServiceTests
{
    private readonly Mock<IFitnessRepository> _repo = new();

    private FitnessService CreateService() => new(_repo.Object);

    private static WorkoutPlan SamplePlan(int id = 1, int userId = 1) => new()
    {
        Id = id,
        UserId = userId,
        Name = "Beginner Plan",
        Description = "Test plan",
        Level = "beginner",
        WorkoutExercises = [],
    };

    private static FavoriteExercise SampleFavorite(int id = 1, int userId = 1) => new()
    {
        Id = id,
        UserId = userId,
        ExternalExerciseId = "0001",
        ExerciseName = "Push Up",
        BodyPart = "chest",
        TargetMuscle = "pectorals",
        Equipment = "body weight",
        GifUrl = "https://example.com/pushup.gif",
    };

    private static WorkoutSession SampleSession(int id = 1, int userId = 1) => new()
    {
        Id = id,
        UserId = userId,
        WorkoutPlanId = 1,
        StartedAt = DateTime.UtcNow,
        Completed = false,
    };

    // ── FavoriteExercises ────────────────────────────────────────────────────

    [Fact]
    public async Task GetFavoriteExercisesAsync_ReturnsMappedResponses()
    {
        _repo.Setup(r => r.GetFavoriteExercisesAsync(1))
            .ReturnsAsync([SampleFavorite(1, 1), SampleFavorite(2, 1)]);

        var service = CreateService();
        var result = await service.GetFavoriteExercisesAsync(1);

        Assert.Equal(2, result.Count());
        Assert.All(result, f => Assert.Equal("Push Up", f.ExerciseName));
    }

    [Fact]
    public async Task GetFavoriteExercisesAsync_NoFavorites_ReturnsEmpty()
    {
        _repo.Setup(r => r.GetFavoriteExercisesAsync(99)).ReturnsAsync([]);

        var service = CreateService();
        var result = await service.GetFavoriteExercisesAsync(99);

        Assert.Empty(result);
    }

    [Fact]
    public async Task AddFavoriteExerciseAsync_ReturnsResponse_WithCorrectData()
    {
        _repo.Setup(r => r.AddFavoriteExerciseAsync(It.IsAny<FavoriteExercise>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();
        var result = await service.AddFavoriteExerciseAsync(1, new CreateFavoriteExerciseRequest
        {
            ExternalExerciseId = "0001",
            ExerciseName = "Push Up",
            BodyPart = "chest",
            TargetMuscle = "pectorals",
            Equipment = "body weight",
            GifUrl = "https://example.com/pushup.gif",
        });

        Assert.NotNull(result);
        Assert.Equal("Push Up", result.ExerciseName);
        Assert.Equal("chest", result.BodyPart);

        _repo.Verify(r => r.AddFavoriteExerciseAsync(
            It.Is<FavoriteExercise>(f => f.UserId == 1 && f.ExerciseName == "Push Up")),
            Times.Once);
    }

    [Fact]
    public async Task DeleteFavoriteExerciseAsync_ExistingFavorite_ReturnsTrue()
    {
        _repo.Setup(r => r.GetFavoriteExerciseByIdAsync(1, 1)).ReturnsAsync(SampleFavorite(1, 1));
        _repo.Setup(r => r.DeleteFavoriteExerciseAsync(It.IsAny<FavoriteExercise>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();
        var result = await service.DeleteFavoriteExerciseAsync(1, 1);

        Assert.True(result);
        _repo.Verify(r => r.DeleteFavoriteExerciseAsync(It.IsAny<FavoriteExercise>()), Times.Once);
    }

    [Fact]
    public async Task DeleteFavoriteExerciseAsync_NonExisting_ReturnsFalse()
    {
        _repo.Setup(r => r.GetFavoriteExerciseByIdAsync(999, 1)).ReturnsAsync((FavoriteExercise?)null);

        var service = CreateService();
        var result = await service.DeleteFavoriteExerciseAsync(999, 1);

        Assert.False(result);
        _repo.Verify(r => r.DeleteFavoriteExerciseAsync(It.IsAny<FavoriteExercise>()), Times.Never);
    }

    // ── WorkoutPlans ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetWorkoutPlansAsync_ReturnsMappedResponses()
    {
        _repo.Setup(r => r.GetWorkoutPlansAsync(1))
            .ReturnsAsync([SamplePlan(1, 1), SamplePlan(2, 1)]);

        var service = CreateService();
        var result = await service.GetWorkoutPlansAsync(1);

        Assert.Equal(2, result.Count());
        Assert.All(result, p => Assert.Equal("Beginner Plan", p.Name));
    }

    [Fact]
    public async Task GetWorkoutPlanByIdAsync_ValidId_ReturnsMappedResponse()
    {
        _repo.Setup(r => r.GetWorkoutPlanByIdAsync(1, 1)).ReturnsAsync(SamplePlan(1, 1));

        var service = CreateService();
        var result = await service.GetWorkoutPlanByIdAsync(1, 1);

        Assert.NotNull(result);
        Assert.Equal("Beginner Plan", result!.Name);
    }

    [Fact]
    public async Task GetWorkoutPlanByIdAsync_InvalidId_ReturnsNull()
    {
        _repo.Setup(r => r.GetWorkoutPlanByIdAsync(999, 1)).ReturnsAsync((WorkoutPlan?)null);

        var service = CreateService();
        var result = await service.GetWorkoutPlanByIdAsync(999, 1);

        Assert.Null(result);
    }

    [Fact]
    public async Task CreateWorkoutPlanAsync_ReturnsResponse_WithCorrectData()
    {
        _repo.Setup(r => r.AddWorkoutPlanAsync(It.IsAny<WorkoutPlan>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();
        var result = await service.CreateWorkoutPlanAsync(1, new CreateWorkoutPlanRequest
        {
            Name = "My Plan",
            Description = "Custom plan",
            Level = "intermediate",
        });

        Assert.NotNull(result);
        Assert.Equal("My Plan", result.Name);

        _repo.Verify(r => r.AddWorkoutPlanAsync(
            It.Is<WorkoutPlan>(p => p.UserId == 1 && p.Name == "My Plan")),
            Times.Once);
    }

    [Fact]
    public async Task DeleteWorkoutPlanAsync_ExistingPlan_ReturnsTrue()
    {
        _repo.Setup(r => r.GetWorkoutPlanByIdAsync(1, 1)).ReturnsAsync(SamplePlan(1, 1));
        _repo.Setup(r => r.DeleteWorkoutPlanAsync(It.IsAny<WorkoutPlan>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();
        var result = await service.DeleteWorkoutPlanAsync(1, 1);

        Assert.True(result);
        _repo.Verify(r => r.DeleteWorkoutPlanAsync(It.IsAny<WorkoutPlan>()), Times.Once);
    }

    [Fact]
    public async Task DeleteWorkoutPlanAsync_NonExisting_ReturnsFalse()
    {
        _repo.Setup(r => r.GetWorkoutPlanByIdAsync(999, 1)).ReturnsAsync((WorkoutPlan?)null);

        var service = CreateService();
        var result = await service.DeleteWorkoutPlanAsync(999, 1);

        Assert.False(result);
        _repo.Verify(r => r.DeleteWorkoutPlanAsync(It.IsAny<WorkoutPlan>()), Times.Never);
    }

    // ── WorkoutSessions ──────────────────────────────────────────────────────

    [Fact]
    public async Task GetWorkoutSessionsAsync_ReturnsMappedResponses()
    {
        _repo.Setup(r => r.GetWorkoutSessionsAsync(1))
            .ReturnsAsync([SampleSession(1, 1), SampleSession(2, 1)]);

        var service = CreateService();
        var result = await service.GetWorkoutSessionsAsync(1);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task StartWorkoutSessionAsync_ValidPlan_ReturnsSession()
    {
        _repo.Setup(r => r.GetWorkoutPlanByIdAsync(1, 1)).ReturnsAsync(SamplePlan(1, 1));
        _repo.Setup(r => r.AddWorkoutSessionAsync(It.IsAny<WorkoutSession>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();
        var result = await service.StartWorkoutSessionAsync(1, new CreateWorkoutSessionRequest
        {
            WorkoutPlanId = 1,
        });

        Assert.NotNull(result);
        Assert.False(result.Completed);

        _repo.Verify(r => r.AddWorkoutSessionAsync(
            It.Is<WorkoutSession>(s => s.UserId == 1 && s.WorkoutPlanId == 1)),
            Times.Once);
    }

    [Fact]
    public async Task StartWorkoutSessionAsync_InvalidPlan_ThrowsException()
    {
        _repo.Setup(r => r.GetWorkoutPlanByIdAsync(999, 1)).ReturnsAsync((WorkoutPlan?)null);

        var service = CreateService();

        await Assert.ThrowsAsync<Exception>(() =>
            service.StartWorkoutSessionAsync(1, new CreateWorkoutSessionRequest { WorkoutPlanId = 999 }));
    }

    [Fact]
    public async Task CompleteWorkoutSessionAsync_ValidSession_ReturnsCompleted()
    {
        var session = SampleSession(1, 1);
        _repo.Setup(r => r.GetWorkoutSessionByIdAsync(1, 1)).ReturnsAsync(session);
        _repo.Setup(r => r.UpdateWorkoutSessionAsync(It.IsAny<WorkoutSession>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();
        var result = await service.CompleteWorkoutSessionAsync(1, 1, new CompleteWorkoutSessionRequest
        {
            DurationMinutes = 45,
            Calories = 300,
        });

        Assert.NotNull(result);
        Assert.True(result!.Completed);
        Assert.Equal(45, result.DurationMinutes);
        Assert.Equal(300, result.Calories);
    }

    [Fact]
    public async Task CompleteWorkoutSessionAsync_InvalidSession_ReturnsNull()
    {
        _repo.Setup(r => r.GetWorkoutSessionByIdAsync(999, 1)).ReturnsAsync((WorkoutSession?)null);

        var service = CreateService();
        var result = await service.CompleteWorkoutSessionAsync(999, 1, new CompleteWorkoutSessionRequest());

        Assert.Null(result);
    }
}