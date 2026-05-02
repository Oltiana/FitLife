using FitLife.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FitLife.Api.Data;

public static class PilatesDbSeeder
{
    public static async Task SeedProgramsAsync(
        PilatesFitLifeDbContext db,
        CancellationToken ct = default)
    {
        if (await db.Programs.AnyAsync(ct))
            return;

        var programs = new[]
        {
            new PilatesProgramEntity
            {
                Id = "core-fundamentals",
                Name = "Core Fundamentals",
                DisplayOrder = 1,
                DurationWeeks = 2,
                Level = "beginner",
                ExercisesJson =
                    "[{\"id\":\"cf-1\",\"name\":\"Breathing & imprint\",\"durationSec\":60,\"description\":\"Lie supine, knees bent. Inhale wide into ribs; exhale and gently imprint lower back toward the mat.\"},{\"id\":\"cf-2\",\"name\":\"Dead bug prep\",\"durationSec\":90,\"description\":\"Arms to ceiling, knees at table-top. Alternate lowering opposite arm and leg with control.\"},{\"id\":\"cf-3\",\"name\":\"Single-leg stretch\",\"durationSec\":60,\"description\":\"Head and shoulders lifted if comfortable. Pull one knee in, extend the other leg long at hip height.\"},{\"id\":\"cf-4\",\"name\":\"Bridge articulation\",\"durationSec\":120,\"description\":\"Peel spine up vertebra by vertebra, then roll down with control. Keep knees aligned over ankles.\"},{\"id\":\"cf-5\",\"name\":\"Side-lying clams\",\"durationSec\":90,\"description\":\"Stack hips and shoulders. Open top knee without rolling the pelvis backward.\"}]"
            },
            new PilatesProgramEntity
            {
                Id = "power-flow",
                Name = "Power Flow",
                DurationWeeks = 4,
                Level = "intermediate",
                ExercisesJson =
                    "[{\"id\":\"pf-1\",\"name\":\"Plank hold\",\"durationSec\":45,\"description\":\"Shoulders over wrists, long line from head to heels. Breathe steadily; soften grip on the floor.\"},{\"id\":\"pf-2\",\"name\":\"Forearm plank rocks\",\"durationSec\":60,\"description\":\"Minimal shift forward and back from forearms. Keep ribs knitted, hips level.\"},{\"id\":\"pf-3\",\"name\":\"Spine stretch forward\",\"durationSec\":75,\"description\":\"Seated, legs hip-width. Round forward from head, articulating through the spine.\"},{\"id\":\"pf-4\",\"name\":\"Swimming prep\",\"durationSec\":90,\"description\":\"Prone, arms long. Lift chest slightly; alternate small arm and leg reaches.\"},{\"id\":\"pf-5\",\"name\":\"Side plank (modified)\",\"durationSec\":45,\"description\":\"Forearm or hand support, hips stacked. Hold or add a controlled hip lift.\"},{\"id\":\"pf-6\",\"name\":\"Roll-down to half roll-back\",\"durationSec\":90,\"description\":\"Seated tall. Nod chin, peel back to mid-back, then return with breath.\"}]"
            },
            new PilatesProgramEntity
            {
                Id = "deep-stretch",
                Name = "Deep Stretch & Restore",
                DisplayOrder = 3,
                DurationWeeks = 2,
                Level = "advanced",
                ExercisesJson =
                    "[{\"id\":\"ds-1\",\"name\":\"Cat–cow\",\"durationSec\":100,\"description\":\"Hands under shoulders, knees under hips. Flex and extend the spine slowly.\"},{\"id\":\"ds-2\",\"name\":\"Child’s pose variation\",\"durationSec\":130,\"description\":\"Knees wide, arms forward or alongside. Breathe into upper back expansion.\"},{\"id\":\"ds-3\",\"name\":\"Figure-four stretch\",\"durationSec\":90,\"description\":\"Supine, ankle over opposite knee. Draw thigh gently toward you for glute/hip release.\"},{\"id\":\"ds-4\",\"name\":\"Supine twist\",\"durationSec\":40,\"description\":\"Knees together, drop to one side; switch. Keep shoulders grounded if possible.\"}]"
            }
        };

        db.Programs.AddRange(programs);
        await db.SaveChangesAsync(ct);
    }
}
