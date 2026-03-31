using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using server.Models.Entities;
namespace server.Data
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<TestResult> TestResults { get; set; }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<TestResult>(entity =>
            {
                entity.HasKey(tr => tr.Id);

                entity.HasOne(tr => tr.User)
      .WithMany(u => u.Results)
      .HasForeignKey(tr => tr.UserId)
      .OnDelete(DeleteBehavior.Restrict)
      .IsRequired();

                // Configure owned value object for TestCharacters
                entity.OwnsOne(tr => tr.TestCharacters, owned =>
                {
                    owned.Property(tc => tc.Correct).HasColumnName("CorrectCharacters");
                    owned.Property(tc => tc.Incorrect).HasColumnName("IncorrectCharacters");
                    owned.Property(tc => tc.Extra).HasColumnName("ExtraCharacters");
                    owned.Property(tc => tc.Missed).HasColumnName("MissedCharacters");
                });


                entity.Property(tr => tr.TestType)
                    .HasMaxLength(50)
                    .HasColumnType("nvarchar(50)");
                entity.Property(tr => tr.TestModifier)
                    .HasMaxLength(50)
                    .HasColumnType("nvarchar(50)");
            });

            builder.Entity<MutltiplayerTestResult>(entity =>
            {
                entity.HasKey(mtr => mtr.Id);
                entity.HasOne(mtr => mtr.WinningTestResult)
                    .WithMany()
                    .HasForeignKey(mtr => mtr.WinningTestResultId);
                entity.HasOne(mtr => mtr.LosingTestResult)
                    .WithMany()
                    .HasForeignKey(mtr => mtr.LosingTestResultId);
            });
        }
    }
}
