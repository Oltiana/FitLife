using Microsoft.EntityFrameworkCore;
using FitLifeAPI.Models.Entities;

namespace FitLifeAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
    }
}