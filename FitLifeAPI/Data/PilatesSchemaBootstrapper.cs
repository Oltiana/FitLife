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
               AND OBJECT_ID(N'[PilatesUserPrograms]', N'U') IS NULL
            BEGIN
                EXEC sp_rename N'[UserEnrollments]', N'UserPrograms';
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[PilatesUserPrograms]', N'U') IS NULL
               AND OBJECT_ID(N'[UserPrograms]', N'U') IS NOT NULL
            BEGIN
                EXEC sp_rename N'[UserPrograms]', N'PilatesUserPrograms';
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[PilatesUserPrograms]', N'U') IS NULL
               AND OBJECT_ID(N'[UserEnrollments]', N'U') IS NOT NULL
            BEGIN
                EXEC sp_rename N'[UserEnrollments]', N'PilatesUserPrograms';
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[PilatesUserPreferences]', N'U') IS NULL
               AND OBJECT_ID(N'[UserPreferences]', N'U') IS NOT NULL
            BEGIN
                EXEC sp_rename N'[UserPreferences]', N'PilatesUserPreferences';
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[PilatesWeightEntries]', N'U') IS NULL
               AND OBJECT_ID(N'[WeightEntries]', N'U') IS NOT NULL
            BEGIN
                EXEC sp_rename N'[WeightEntries]', N'PilatesWeightEntries';
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[PilatesWorkoutCompletions]', N'U') IS NULL
               AND OBJECT_ID(N'[WorkoutCompletions]', N'U') IS NOT NULL
            BEGIN
                EXEC sp_rename N'[WorkoutCompletions]', N'PilatesWorkoutCompletions';
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
                    [ExercisesJson] nvarchar(max) NOT NULL,
                    [DisplayOrder] int NOT NULL CONSTRAINT [DF_PilatesPrograms_DisplayOrder] DEFAULT (0)
                );
            END
            """,
            ct);

        /* Kolona e re: batch i veçantë — SQL Server nuk lejon UPDATE me DisplayOrder në të njëjtin batch me ALTER ADD. */
        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[PilatesPrograms]', N'U') IS NOT NULL
               AND COL_LENGTH(N'PilatesPrograms', N'DisplayOrder') IS NULL
            BEGIN
                ALTER TABLE [dbo].[PilatesPrograms] ADD [DisplayOrder] int NULL;
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[PilatesPrograms]', N'U') IS NOT NULL
               AND COL_LENGTH(N'PilatesPrograms', N'DisplayOrder') IS NOT NULL
            BEGIN
                UPDATE [dbo].[PilatesPrograms] SET [DisplayOrder] = 1 WHERE [Id] = N'core-fundamentals' AND ([DisplayOrder] IS NULL OR [DisplayOrder] = 0);
                UPDATE [dbo].[PilatesPrograms] SET [DisplayOrder] = 2 WHERE [Id] = N'power-flow' AND ([DisplayOrder] IS NULL OR [DisplayOrder] = 0);
                UPDATE [dbo].[PilatesPrograms] SET [DisplayOrder] = 3 WHERE [Id] = N'deep-stretch' AND ([DisplayOrder] IS NULL OR [DisplayOrder] = 0);

                ;WITH o AS (
                    SELECT [Id], ROW_NUMBER() OVER (ORDER BY [Name]) AS rn
                    FROM [dbo].[PilatesPrograms]
                    WHERE [DisplayOrder] IS NULL OR [DisplayOrder] = 0
                )
                UPDATE p
                SET p.[DisplayOrder] = 10 + o.rn
                FROM [dbo].[PilatesPrograms] p
                INNER JOIN o ON p.[Id] = o.[Id];

                IF EXISTS (
                    SELECT 1
                    FROM sys.columns c
                    WHERE c.object_id = OBJECT_ID(N'dbo.PilatesPrograms')
                      AND c.name = N'DisplayOrder'
                      AND c.is_nullable = 1
                )
                BEGIN
                    ALTER TABLE [dbo].[PilatesPrograms] ALTER COLUMN [DisplayOrder] int NOT NULL;
                END

                IF NOT EXISTS (
                    SELECT 1
                    FROM sys.columns c
                    WHERE c.object_id = OBJECT_ID(N'dbo.PilatesPrograms')
                      AND c.name = N'DisplayOrder'
                      AND c.default_object_id <> 0
                )
                BEGIN
                    ALTER TABLE [dbo].[PilatesPrograms] ADD CONSTRAINT [DF_PilatesPrograms_DisplayOrder] DEFAULT (0) FOR [DisplayOrder];
                END
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[Programs]', N'U') IS NOT NULL
               AND OBJECT_ID(N'[PilatesPrograms]', N'U') IS NOT NULL
            BEGIN
                INSERT INTO [PilatesPrograms] ([Id], [Name], [DurationWeeks], [Level], [ExercisesJson], [DisplayOrder])
                SELECT p.[Id], p.[Name], p.[DurationWeeks], p.[Level], p.[ExercisesJson], 0
                FROM [Programs] p
                WHERE NOT EXISTS (
                    SELECT 1 FROM [PilatesPrograms] pp WHERE pp.[Id] = p.[Id]
                );
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[PilatesUserPrograms]', N'U') IS NULL
            BEGIN
                CREATE TABLE [PilatesUserPrograms] (
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
                  AND object_id = OBJECT_ID(N'[PilatesUserPrograms]')
            )
            BEGIN
                CREATE UNIQUE INDEX [IX_UserEnrollments_UserId_ProgramId]
                    ON [PilatesUserPrograms]([UserId], [ProgramId]);
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[UserEnrollments]', N'U') IS NOT NULL
               AND OBJECT_ID(N'[PilatesUserPrograms]', N'U') IS NOT NULL
            BEGIN
                INSERT INTO [PilatesUserPrograms] ([Id], [UserId], [ProgramId], [EnrolledAt])
                SELECT ue.[Id], ue.[UserId], ue.[ProgramId], ue.[EnrolledAt]
                FROM [UserEnrollments] ue
                WHERE NOT EXISTS (
                    SELECT 1 FROM [PilatesUserPrograms] pup WHERE pup.[Id] = ue.[Id]
                );
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[PilatesUserPreferences]', N'U') IS NULL
            BEGIN
                CREATE TABLE [PilatesUserPreferences] (
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
            IF OBJECT_ID(N'[PilatesWeightEntries]', N'U') IS NULL
            BEGIN
                CREATE TABLE [PilatesWeightEntries] (
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
            IF OBJECT_ID(N'[PilatesWorkoutCompletions]', N'U') IS NULL
            BEGIN
                CREATE TABLE [PilatesWorkoutCompletions] (
                    [Id] nvarchar(450) NOT NULL PRIMARY KEY,
                    [WorkoutId] nvarchar(max) NOT NULL,
                    [WorkoutTitle] nvarchar(max) NOT NULL,
                    [CompletedAt] datetimeoffset NOT NULL,
                    [DurationMinutes] int NOT NULL,
                    [UserId] nvarchar(max) NOT NULL,
                    [CaloriesBurned] int NULL,
                    [DisplayOrder] int NOT NULL CONSTRAINT DF_PilatesWorkoutCompletions_DisplayOrder DEFAULT 0
                );
            END
            """,
            ct);

        /* Older tables may lack CaloriesBurned — INSERT fails until column exists. */
        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[PilatesWorkoutCompletions]', N'U') IS NOT NULL
               AND COL_LENGTH(N'PilatesWorkoutCompletions', N'CaloriesBurned') IS NULL
                ALTER TABLE [PilatesWorkoutCompletions] ADD [CaloriesBurned] int NULL;
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF OBJECT_ID(N'[PilatesWorkoutCompletions]', N'U') IS NOT NULL
               AND COL_LENGTH(N'PilatesWorkoutCompletions', N'DisplayOrder') IS NULL
            BEGIN
                ALTER TABLE [dbo].[PilatesWorkoutCompletions] ADD [DisplayOrder] int NULL;
            END
            """,
            ct);

        await db.Database.ExecuteSqlRawAsync(
            """
            IF EXISTS (
                SELECT 1
                FROM sys.columns c
                WHERE c.object_id = OBJECT_ID(N'dbo.PilatesWorkoutCompletions')
                  AND c.name = N'DisplayOrder'
                  AND c.is_nullable = 1
            )
            BEGIN
                ;WITH r AS (
                    SELECT Id,
                           ROW_NUMBER() OVER (PARTITION BY UserId ORDER BY CompletedAt ASC, Id ASC) AS rn
                    FROM dbo.PilatesWorkoutCompletions
                )
                UPDATE t
                SET t.DisplayOrder = r.rn
                FROM dbo.PilatesWorkoutCompletions t
                INNER JOIN r ON t.Id = r.Id
                WHERE t.DisplayOrder IS NULL;

                ALTER TABLE [dbo].[PilatesWorkoutCompletions] ALTER COLUMN [DisplayOrder] int NOT NULL;
            END
            """,
            ct);

    }
}
