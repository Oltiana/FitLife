using Microsoft.EntityFrameworkCore;

namespace FitLife.Api.Data;

public static class PilatesSchemaBootstrapper
{
    public static async Task EnsureSchemaAsync(
        PilatesFitLifeDbContext db,
        CancellationToken ct = default)
    {
        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[Programs]', N'U') IS NULL
            BEGIN
                CREATE TABLE [Programs] (
                    [Id] nvarchar(450) NOT NULL PRIMARY KEY,
                    [Name] nvarchar(max) NOT NULL,
                    [DurationWeeks] int NOT NULL,
                    [Level] nvarchar(max) NOT NULL,
                    [ExercisesJson] nvarchar(max) NOT NULL
                );
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[UserEnrollments]', N'U') IS NULL
            BEGIN
                CREATE TABLE [UserEnrollments] (
                    [Id] nvarchar(450) NOT NULL PRIMARY KEY,
                    [UserId] nvarchar(450) NOT NULL,
                    [ProgramId] nvarchar(450) NOT NULL,
                    [EnrolledAt] datetimeoffset NOT NULL
                );
            END
            IF NOT EXISTS (
                SELECT 1
                FROM sys.indexes
                WHERE name = N'IX_UserEnrollments_UserId_ProgramId'
                  AND object_id = OBJECT_ID(N'[UserEnrollments]')
            )
            BEGIN
                CREATE UNIQUE INDEX [IX_UserEnrollments_UserId_ProgramId]
                    ON [UserEnrollments]([UserId], [ProgramId]);
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[UserPreferences]', N'U') IS NULL
            BEGIN
                CREATE TABLE [UserPreferences] (
                    [UserId] nvarchar(450) NOT NULL PRIMARY KEY,
                    [OnboardingComplete] bit NOT NULL,
                    [DailyCalorieTarget] int NULL,
                    [DailyMinutesTarget] int NULL
                );
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[Users]', N'U') IS NULL
            BEGIN
                CREATE TABLE [Users] (
                    [Id] nvarchar(450) NOT NULL PRIMARY KEY,
                    [DisplayName] nvarchar(max) NOT NULL
                );
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[WorkoutCompletions]', N'U') IS NULL
            BEGIN
                CREATE TABLE [WorkoutCompletions] (
                    [Id] nvarchar(450) NOT NULL PRIMARY KEY,
                    [WorkoutId] nvarchar(max) NOT NULL,
                    [WorkoutTitle] nvarchar(max) NOT NULL,
                    [CompletedAt] datetimeoffset NOT NULL,
                    [DurationMinutes] int NOT NULL,
                    [UserId] nvarchar(max) NOT NULL,
                    [CaloriesBurned] int NULL
                );
            END
            """,
            ct);

    }
}
