using FitLifeAPI.Data;
using FitLifeAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace FitLifeAPI.Services
{
    public static class PilatesProgressContentHelper
    {
        public static async Task EnsureSeedAsync(AppDbContext context)
        {
            if (!await context.PilatesProgressUiConfigs.AnyAsync())
            {
                context.PilatesProgressUiConfigs.Add(new PilatesProgressUiConfig());
            }

            if (!await context.PilatesProgressPeriodSettings.AnyAsync())
            {
                context.PilatesProgressPeriodSettings.AddRange(
                    new PilatesProgressPeriodSetting
                    {
                        Period = "Daily",
                        SectionTitle = "Today",
                        Description = "Daily minutes and estimated calories.",
                        TargetCalories = 200,
                        TargetMinutes = 20,
                        MinutesChartTitle = "Minutes (last 7 days)",
                        CaloriesChartTitle = "Calories (last 7 days)",
                        DisplayOrder = 0,
                    },
                    new PilatesProgressPeriodSetting
                    {
                        Period = "Weekly",
                        SectionTitle = "This week vs last week",
                        Description = "Compare your weekly totals.",
                        TargetCalories = 1200,
                        TargetMinutes = 120,
                        MinutesChartTitle = "Minutes by week (last 4 weeks)",
                        CaloriesChartTitle = "Calories by week (last 4 weeks)",
                        DisplayOrder = 1,
                    },
                    new PilatesProgressPeriodSetting
                    {
                        Period = "Monthly",
                        SectionTitle = "Monthly focus",
                        Description = "Set a monthly direction for your practice.",
                        TargetCalories = 5000,
                        TargetMinutes = 500,
                        DisplayOrder = 2,
                    });
            }

            if (!await context.PilatesMotivationMessages.AnyAsync())
            {
                context.PilatesMotivationMessages.AddRange(
                    new PilatesMotivationMessage
                    {
                        Message = "Every mindful minute adds up — keep showing up for yourself.",
                        DisplayOrder = 0,
                    },
                    new PilatesMotivationMessage
                    {
                        Message = "Small steps today build stronger habits tomorrow.",
                        DisplayOrder = 1,
                    },
                    new PilatesMotivationMessage
                    {
                        Message = "Your body appreciates the consistency, not the perfection.",
                        DisplayOrder = 2,
                    },
                    new PilatesMotivationMessage
                    {
                        Message = "Progress is built one session at a time.",
                        DisplayOrder = 3,
                    });
            }

            await context.SaveChangesAsync();
        }

        public static async Task<PilatesProgressUiConfig> GetUiConfigAsync(AppDbContext context)
        {
            return await context.PilatesProgressUiConfigs
                .OrderBy(c => c.Id)
                .FirstAsync();
        }

        public static async Task<object> GetContentAsync(AppDbContext context)
        {
            var ui = await context.PilatesProgressUiConfigs.AsNoTracking()
                .OrderBy(c => c.Id)
                .FirstAsync();
            var periods = await context.PilatesProgressPeriodSettings.AsNoTracking()
                .OrderBy(p => p.DisplayOrder)
                .ToListAsync();
            var messages = await context.PilatesMotivationMessages.AsNoTracking()
                .OrderBy(m => m.DisplayOrder)
                .ThenBy(m => m.Id)
                .ToListAsync();
            return new { ui, periods, messages };
        }
    }
}
