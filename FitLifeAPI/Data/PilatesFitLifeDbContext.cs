using FitLife.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FitLife.Api.Data;

public class PilatesFitLifeDbContext : DbContext
{
    public PilatesFitLifeDbContext(DbContextOptions<PilatesFitLifeDbContext> options)
        : base(options) { }

    public DbSet<PilatesProgramEntity> Programs => Set<PilatesProgramEntity>();
    public DbSet<PilatesWorkoutCompletionEntity> WorkoutCompletions => Set<PilatesWorkoutCompletionEntity>();
    public DbSet<PilatesUserEnrollmentEntity> UserEnrollments => Set<PilatesUserEnrollmentEntity>();
    public DbSet<PilatesUserPreferenceEntity> UserPreferences => Set<PilatesUserPreferenceEntity>();
    public DbSet<PilatesWeightEntryEntity> WeightEntries => Set<PilatesWeightEntryEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PilatesProgramEntity>().ToTable("PilatesPrograms");
        modelBuilder.Entity<PilatesWorkoutCompletionEntity>().ToTable("WorkoutCompletions");
        modelBuilder.Entity<PilatesUserEnrollmentEntity>().ToTable("UserPrograms");
        modelBuilder.Entity<PilatesUserPreferenceEntity>().ToTable("UserPreferences");
        modelBuilder.Entity<PilatesWeightEntryEntity>().ToTable("WeightEntries");

        modelBuilder.Entity<PilatesProgramEntity>().HasKey(x => x.Id);
        modelBuilder.Entity<PilatesWorkoutCompletionEntity>().HasKey(x => x.Id);
        modelBuilder.Entity<PilatesUserEnrollmentEntity>().HasKey(x => x.Id);
        modelBuilder.Entity<PilatesUserPreferenceEntity>().HasKey(x => x.UserId);
        modelBuilder.Entity<PilatesWeightEntryEntity>().HasKey(x => x.Id);

        modelBuilder.Entity<PilatesUserEnrollmentEntity>()
            .HasIndex(x => new { x.UserId, x.ProgramId })
            .IsUnique();

        modelBuilder.Entity<PilatesWeightEntryEntity>()
            .Property(x => x.Kg)
            .HasColumnType("decimal(6,2)");
    }
}
