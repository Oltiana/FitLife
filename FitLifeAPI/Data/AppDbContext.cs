using Microsoft.EntityFrameworkCore;
using FitLifeAPI.Models.Entities;

namespace FitLifeAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }  // ✚ shto


        protected override void OnModelCreating(ModelBuilder modelBuilder)  // ✚ shto
        {
            modelBuilder.Entity<RefreshToken>()
                .HasOne(r => r.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }

    }
}