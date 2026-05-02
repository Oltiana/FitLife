using Microsoft.EntityFrameworkCore;
using FitLifeAPI.Models.Entities;

namespace FitLifeAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }  
        public DbSet<WorkoutPlan> WorkoutPlans { get; set; }
        public DbSet<WorkoutExercise> WorkoutExercises { get; set; }
        public DbSet<WorkoutSession> WorkoutSessions { get; set; }
        public DbSet<FavoriteExercise> FavoriteExercises { get; set; }
        public DbSet<PilatesProgram> PilatesPrograms { get; set; }
        public DbSet<PilatesWorkout> PilatesWorkouts { get; set; }
        public DbSet<UserPilatesEnrollment> UserPilatesEnrollments { get; set; }
        public DbSet<UserPilatesProgress> UserPilatesProgresses { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)  
        {
            modelBuilder.Entity<RefreshToken>()
                .HasOne(r => r.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
             
            modelBuilder.Entity<WorkoutPlan>()
                .HasOne(wp => wp.User)
                .WithMany(u => u.WorkoutPlans)
                .HasForeignKey(wp => wp.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<WorkoutExercise>()
                .HasOne(we => we.WorkoutPlan)
                .WithMany(wp => wp.WorkoutExercises)
                .HasForeignKey(we => we.WorkoutPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<WorkoutSession>()
                .HasOne(ws => ws.User)
                .WithMany(u => u.WorkoutSessions)
                .HasForeignKey(ws => ws.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<WorkoutSession>()
                .HasOne(ws => ws.WorkoutPlan)
                .WithMany(wp => wp.WorkoutSessions)
                .HasForeignKey(ws => ws.WorkoutPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<FavoriteExercise>()
                .HasOne(fe => fe.User)
                .WithMany(u => u.FavoriteExercises)
                .HasForeignKey(fe => fe.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PilatesWorkout>()
                .HasOne(w => w.Program)
                .WithMany(p => p.Workouts)
                .HasForeignKey(w => w.PilatesProgramId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserPilatesEnrollment>()
                .HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserPilatesEnrollment>()
                .HasOne(e => e.Program)
                .WithMany(p => p.Enrollments)
                .HasForeignKey(e => e.PilatesProgramId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserPilatesProgress>()
                .HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserPilatesProgress>()
                .HasOne(p => p.Workout)
                .WithMany(w => w.Progresses)
                .HasForeignKey(p => p.PilatesWorkoutId)
                .OnDelete(DeleteBehavior.Cascade);
        }

    }
}