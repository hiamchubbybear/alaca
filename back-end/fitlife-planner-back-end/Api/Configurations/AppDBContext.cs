using System.Text.Json;
using fitlife_planner_back_end.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace fitlife_planner_back_end.Api.Configurations
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Token> Tokens { get; set; }
        public DbSet<Profile> Profiles { get; set; }
        public DbSet<BMIRecord> BmiRecords { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)").IsRequired();
                entity.HasIndex(e => e.Email).IsUnique();

                entity.Property(e => e.Password);
                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .ValueGeneratedOnAdd()
                    .HasDefaultValueSql("CURRENT_TIMESTAMP")
                    .Metadata.SetAfterSaveBehavior(Microsoft.EntityFrameworkCore.Metadata.PropertySaveBehavior.Ignore);
                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .ValueGeneratedOnAddOrUpdate()
                    .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
                entity.Property(e => e.Role);
                entity.Property(e => e.PhoneNumber)
                    .HasMaxLength(15)
                    .HasDefaultValue("")
                    .IsRequired(false);
                entity.Property(e => e.IsVerified).HasDefaultValue(false);
            });


            modelBuilder.Entity<Profile>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)").IsRequired();
                entity.HasIndex(e => e.UserId).IsUnique();

                entity.Property(e => e.DisplayName).HasMaxLength(100);
                entity.Property(e => e.AvatarUrl).HasMaxLength(200).IsRequired(false);
                entity.Property(e => e.Bio).HasMaxLength(500).IsRequired(false);
                entity.Property(e => e.CreateAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdateAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");


                entity.HasOne<User>()
                    .WithOne()
                    .HasForeignKey<Profile>(p => p.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });


            modelBuilder.Entity<BMIRecord>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.UserId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.HeightCm);
                entity.Property(e => e.WeightKg);
                entity.Property(e => e.BMI);
                entity.Property(e => e.Assessment).HasMaxLength(50);
                entity.Property(e => e.IsCurrent).HasDefaultValue(true);
                entity.Property(e => e.IsComplete).HasDefaultValue(false);
                entity.Property(e => e.MeasuredAt).HasColumnType("datetime")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedAt).HasColumnType("datetime")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.Goal)
                    .HasConversion(
                        v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                        v => JsonSerializer.Deserialize<Dictionary<string, object>>(v, (JsonSerializerOptions)null))
                    .HasColumnType("text")
                    .IsRequired(false);
                entity.HasOne<Profile>()
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });


            modelBuilder.Entity<Token>(entity =>
            {
                entity.HasKey(t => t.Id);
                entity.Property(t => t.RefreshToken).IsRequired();
                entity.Property(t => t.CreatedAt).IsRequired();
                entity.Property(t => t.Revoked).HasDefaultValue(false);
                entity.HasOne(t => t.User)
                    .WithMany()
                    .HasForeignKey(t => t.UserId)
                    .IsRequired();
            });
        }
    }
}