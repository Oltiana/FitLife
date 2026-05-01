using FitLife.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FitLife.Api.Data;

public class PilatesFitLifeDbContext : DbContext
{
    public PilatesFitLifeDbContext(DbContextOptions<PilatesFitLifeDbContext> options)
        : base(options) { }

    public DbSet<PilatesAppUser> Users => Set<PilatesAppUser>();
    public DbSet<PilatesProgramEntity> Programs => Set<PilatesProgramEntity>();
    public DbSet<PilatesWorkoutCompletionEntity> WorkoutCompletions => Set<PilatesWorkoutCompletionEntity>();
    public DbSet<PilatesUserEnrollmentEntity> UserEnrollments => Set<PilatesUserEnrollmentEntity>();
    public DbSet<PilatesUserPreferenceEntity> UserPreferences => Set<PilatesUserPreferenceEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PilatesAppUser>().HasKey(x => x.Id);
        modelBuilder.Entity<PilatesProgramEntity>().HasKey(x => x.Id);
        modelBuilder.Entity<PilatesWorkoutCompletionEntity>().HasKey(x => x.Id);
        modelBuilder.Entity<PilatesUserEnrollmentEntity>().HasKey(x => x.Id);
        modelBuilder.Entity<PilatesUserPreferenceEntity>().HasKey(x => x.UserId);

        modelBuilder.Entity<PilatesUserEnrollmentEntity>()
            .HasIndex(x => new { x.UserId, x.ProgramId })
            .IsUnique();
    }
}
