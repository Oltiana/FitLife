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
            IF OBJECT_ID(N'[Programs]', N'U') IS NOT NULL
               AND OBJECT_ID(N'[PilatesPrograms]', N'U') IS NULL
            BEGIN
                EXEC sp_rename N'[Programs]', N'PilatesPrograms';
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[UserEnrollments]', N'U') IS NOT NULL
               AND OBJECT_ID(N'[UserPrograms]', N'U') IS NULL
            BEGIN
                EXEC sp_rename N'[UserEnrollments]', N'UserPrograms';
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[PilatesPrograms]', N'U') IS NULL
            BEGIN
                CREATE TABLE [PilatesPrograms] (
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
            IF OBJECT_ID(N'[Programs]', N'U') IS NOT NULL
               AND OBJECT_ID(N'[PilatesPrograms]', N'U') IS NOT NULL
            BEGIN
                INSERT INTO [PilatesPrograms] ([Id], [Name], [DurationWeeks], [Level], [ExercisesJson])
                SELECT p.[Id], p.[Name], p.[DurationWeeks], p.[Level], p.[ExercisesJson]
                FROM [Programs] p
                WHERE NOT EXISTS (
                    SELECT 1 FROM [PilatesPrograms] pp WHERE pp.[Id] = p.[Id]
                );
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[UserPrograms]', N'U') IS NULL
            BEGIN
                CREATE TABLE [UserPrograms] (
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
                  AND object_id = OBJECT_ID(N'[UserPrograms]')
            )
            BEGIN
                CREATE UNIQUE INDEX [IX_UserEnrollments_UserId_ProgramId]
                    ON [UserPrograms]([UserId], [ProgramId]);
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[UserEnrollments]', N'U') IS NOT NULL
               AND OBJECT_ID(N'[UserPrograms]', N'U') IS NOT NULL
            BEGIN
                INSERT INTO [UserPrograms] ([Id], [UserId], [ProgramId], [EnrolledAt])
                SELECT ue.[Id], ue.[UserId], ue.[ProgramId], ue.[EnrolledAt]
                FROM [UserEnrollments] ue
                WHERE NOT EXISTS (
                    SELECT 1 FROM [UserPrograms] up WHERE up.[Id] = ue.[Id]
                );
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
            IF OBJECT_ID(N'[WeightEntries]', N'U') IS NULL
            BEGIN
                CREATE TABLE [WeightEntries] (
                    [Id] nvarchar(450) NOT NULL PRIMARY KEY,
                    [UserId] nvarchar(450) NOT NULL,
                    [LoggedAt] datetime2 NOT NULL,
                    [Kg] decimal(6,2) NOT NULL
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
