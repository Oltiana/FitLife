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
        }

    }
}