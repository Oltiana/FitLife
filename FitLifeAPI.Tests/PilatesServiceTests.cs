using FitLifeAPI.DTOs.Requests;
using FitLifeAPI.Models.Entities;
using FitLifeAPI.Repositories.Interfaces;
using FitLifeAPI.Services;
using Moq;

namespace FitLifeAPI.Tests;

public class PilatesServiceTests
{
    private readonly Mock<IPilatesRepository> _repo = new();

    private PilatesService CreateService() => new(_repo.Object);

    private static PilatesProgram SampleProgram(int programId = 1)
    {
        return new PilatesProgram
        {
            Id = programId,
            Name = "Core Flow",
            Description = "Test program",
            DurationWeeks = 4,
            Level = "beginner",
            DisplayOrder = 1,
            Workouts =
            [
                new PilatesWorkout
                {
                    Id = 10,
                    PilatesProgramId = programId,
                    Name = "Session A",
                    Description = "First",
                    DurationMinutes = 30,
                    EstimatedCalories = 0,
                    OrderIndex = 1,
                },
                new PilatesWorkout
                {
                    Id = 11,
                    PilatesProgramId = programId,
                    Name = "Session B",
                    Description = "Second",
                    DurationMinutes = 20,
                    EstimatedCalories = 120,
                    OrderIndex = 2,
                },
            ],
        };
    }

    [Fact]
    public async Task EnrollAsync_Throws_WhenAlreadyEnrolled()
    {
        _repo.Setup(r => r.GetEnrollmentAsync(1, 5))
            .ReturnsAsync(new UserPilatesEnrollment { UserId = 1, PilatesProgramId = 5 });

        var service = CreateService();

        await Assert.ThrowsAsync<Exception>(() =>
            service.EnrollAsync(1, new EnrollPilatesProgramRequest { PilatesProgramId = 5 }));
    }

    [Fact]
    public async Task EnrollAsync_ReturnsZeroProgress_ForNewEnrollment()
    {
        _repo.Setup(r => r.GetEnrollmentAsync(1, 5)).ReturnsAsync((UserPilatesEnrollment?)null);
        _repo.Setup(r => r.AddEnrollmentAsync(It.IsAny<UserPilatesEnrollment>()))
            .Returns(Task.CompletedTask);
        _repo.Setup(r => r.GetProgramByIdAsync(5)).ReturnsAsync(SampleProgram(5));

        var service = CreateService();
        var result = await service.EnrollAsync(1, new EnrollPilatesProgramRequest { PilatesProgramId = 5 });

        Assert.Equal(5, result.PilatesProgramId);
        Assert.Equal("Core Flow", result.ProgramName);
        Assert.Equal(2, result.TotalWorkouts);
        Assert.Equal(0, result.CompletedWorkouts);
        Assert.Equal(0, result.ProgressPercent);
    }

    [Fact]
    public async Task GetProgramByIdAsync_MarksCompletedWorkouts_ForUser()
    {
        var program = SampleProgram();
        _repo.Setup(r => r.GetProgramByIdAsync(1)).ReturnsAsync(program);
        _repo.Setup(r => r.GetUserProgressAsync(7, 1))
            .ReturnsAsync(
            [
                new UserPilatesProgress
                {
                    UserId = 7,
                    PilatesWorkoutId = 10,
                    IsCompleted = true,
                },
            ]);

        var service = CreateService();
        var result = await service.GetProgramByIdAsync(1, 7);

        Assert.NotNull(result);
        Assert.True(result!.Workouts.First(w => w.Id == 10).IsCompleted);
        Assert.False(result.Workouts.First(w => w.Id == 11).IsCompleted);
    }

    [Fact]
    public async Task CompleteWorkoutAsync_InsertsProgress_AndReturnsFiftyPercent()
    {
        var program = SampleProgram();
        var workout = program.Workouts.First();
        workout.Program = program;

        _repo.Setup(r => r.GetWorkoutByIdAsync(10)).ReturnsAsync(workout);
        _repo.Setup(r => r.GetProgressAsync(3, 10)).ReturnsAsync((UserPilatesProgress?)null);
        _repo.Setup(r => r.AddProgressAsync(It.IsAny<UserPilatesProgress>()))
            .Returns(Task.CompletedTask);
        _repo.Setup(r => r.GetUserProgressAsync(3, 1))
            .ReturnsAsync(
            [
                new UserPilatesProgress { UserId = 3, PilatesWorkoutId = 10, IsCompleted = true },
            ]);
        _repo.Setup(r => r.GetProgramByIdAsync(1)).ReturnsAsync(program);

        var service = CreateService();
        var result = await service.CompleteWorkoutAsync(
            3,
            new CompletePilatesWorkoutRequest
            {
                PilatesWorkoutId = 10,
                ProgramName = "Core Flow",
                WorkoutName = "Session A",
                ExercisesCompleted = ["Breathing", "Roll-up"],
            });

        Assert.NotNull(result);
        Assert.Equal(1, result!.CompletedWorkouts);
        Assert.Equal(2, result.TotalWorkouts);
        Assert.Equal(50, result.ProgressPercent);

        _repo.Verify(
            r => r.AddProgressAsync(
                It.Is<UserPilatesProgress>(p =>
                    p.UserId == 3 &&
                    p.PilatesWorkoutId == 10 &&
                    p.IsCompleted &&
                    p.ExercisesCompleted == "Breathing • Roll-up" &&
                    p.CaloriesBurned == 98)),
            Times.Once);
    }

    [Fact]
    public async Task CompleteWorkoutAsync_UsesEstimatedCalories_WhenSetOnWorkout()
    {
        var program = SampleProgram();
        var workout = program.Workouts.First(w => w.Id == 11);
        workout.Program = program;

        _repo.Setup(r => r.GetWorkoutByIdAsync(11)).ReturnsAsync(workout);
        _repo.Setup(r => r.GetProgressAsync(3, 11)).ReturnsAsync((UserPilatesProgress?)null);
        _repo.Setup(r => r.AddProgressAsync(It.IsAny<UserPilatesProgress>()))
            .Returns(Task.CompletedTask);
        _repo.Setup(r => r.GetUserProgressAsync(3, 1))
            .ReturnsAsync(
            [
                new UserPilatesProgress { UserId = 3, PilatesWorkoutId = 11, IsCompleted = true },
            ]);
        _repo.Setup(r => r.GetProgramByIdAsync(1)).ReturnsAsync(program);

        var service = CreateService();
        await service.CompleteWorkoutAsync(
            3,
            new CompletePilatesWorkoutRequest { PilatesWorkoutId = 11 });

        _repo.Verify(
            r => r.AddProgressAsync(
                It.Is<UserPilatesProgress>(p => p.CaloriesBurned == 120)),
            Times.Once);
    }

    [Fact]
    public async Task CompleteWorkoutAsync_ReturnsNull_WhenWorkoutMissing()
    {
        _repo.Setup(r => r.GetWorkoutByIdAsync(999)).ReturnsAsync((PilatesWorkout?)null);
        _repo.Setup(r => r.GetProgressAsync(1, 999)).ReturnsAsync((UserPilatesProgress?)null);
        _repo.Setup(r => r.AddProgressAsync(It.IsAny<UserPilatesProgress>()))
            .Returns(Task.CompletedTask);

        var service = CreateService();
        var result = await service.CompleteWorkoutAsync(
            1,
            new CompletePilatesWorkoutRequest { PilatesWorkoutId = 999 });

        Assert.Null(result);
    }
}
