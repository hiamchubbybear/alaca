using System.Text.Json;
using fitlife_planner_back_end.Api.Models;
using Microsoft.EntityFrameworkCore;
using fitlife_planner_back_end.Api.Enums;
namespace fitlife_planner_back_end.Api.Configurations
{
    public partial class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Token> Tokens { get; set; }
        public DbSet<Profile> Profiles { get; set; }
        public DbSet<BMIRecord> BmiRecords { get; set; }
        public DbSet<Post> Posts { get; set; }

        // Nutrition
        public DbSet<FoodItem> FoodItems { get; set; }
        public DbSet<NutritionPlan> NutritionPlans { get; set; }
        public DbSet<NutritionPlanItem> NutritionPlanItems { get; set; }

        // Exercise & Workout
        public DbSet<ExerciseLibrary> ExerciseLibrary { get; set; }
        public DbSet<ExerciseTag> ExerciseTags { get; set; }
        public DbSet<Workout> Workouts { get; set; }
        public DbSet<WorkoutExercise> WorkoutExercises { get; set; }
        public DbSet<WorkoutSchedule> WorkoutSchedules { get; set; }

        // Progress & Challenges
        public DbSet<ProgressEntry> ProgressEntries { get; set; }
        public DbSet<Challenge> Challenges { get; set; }
        public DbSet<ChallengeParticipant> ChallengeParticipants { get; set; }

        // Social Features
        public DbSet<PostLike> PostLikes { get; set; }
        public DbSet<PostComment> PostComments { get; set; }
        public DbSet<PostVote> PostVotes { get; set; }
        public DbSet<UserFollower> UserFollowers { get; set; }

        // Messaging & Reviews
        public DbSet<Message> Messages { get; set; }
        public DbSet<Review> Reviews { get; set; }

        // Notifications & Settings
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<UserSettings> UserSettings { get; set; }

        // Statistics
        public DbSet<StatsUserWeekly> StatsUserWeekly { get; set; }

        // Gamification
        public DbSet<Achievement> Achievements { get; set; }
        public DbSet<UserAchievement> UserAchievements { get; set; }
        public DbSet<Streak> Streaks { get; set; }


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
                entity.HasKey(e => e.ProfileId);
                entity.Property(e => e.ProfileId).HasColumnType("char(36)").IsRequired();
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
            modelBuilder.Entity<Post>(entity =>
            {
                entity.HasKey(e => e.PostId);
                entity.Property(e => e.PostId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.ProfileId)
                    .HasColumnType("char(36)")
                    .IsRequired();
                entity.Property(e => e.Content).HasMaxLength(500).IsRequired(false);
                entity.Property(e => e.Media).HasMaxLength(200).IsRequired(false);
                entity.Property(e => e.LikeCount).HasDefaultValue(0);
                entity.Property(e => e.UpvoteCount).HasDefaultValue(0);
                entity.Property(e => e.DownvoteCount).HasDefaultValue(0);
                entity.Property(e => e.CommentCount).HasDefaultValue(0);
                entity.Property(e => e.Status).HasDefaultValue(Status.Pending);
                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

                entity.HasOne(p => p.Profile)
                    .WithMany(pr => pr.Posts)
                    .HasForeignKey(p => p.ProfileId)
                    .OnDelete(DeleteBehavior.Cascade);
            });


            modelBuilder.Entity<BMIRecord>(entity =>
            {
                entity.HasKey(e => e.BmiRecordId);
                entity.Property(e => e.BmiRecordId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.ProfileId).HasColumnType("char(36)").IsRequired();
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
                entity.HasOne(e => e.Profile)
                    .WithMany(p => p.BmiRecords)
                    .HasForeignKey(e => e.ProfileId)
                    .OnDelete(DeleteBehavior.Cascade);
            });


            modelBuilder.Entity<Token>(entity =>
            {
                entity.HasKey(t => t.TokenId);
                entity.Property(t => t.RefreshToken).IsRequired();
                entity.Property(t => t.CreatedAt).IsRequired();
                entity.Property(t => t.Revoked).HasDefaultValue(false);
                entity.HasOne(t => t.User)
                    .WithMany()
                    .HasForeignKey(t => t.UserId)
                    .IsRequired();
            });

            // Nutrition Management
            modelBuilder.Entity<FoodItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnType("datetime");
            });

            modelBuilder.Entity<NutritionPlan>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.OwnerUserId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.Title).HasMaxLength(255);
                entity.Property(e => e.Description).HasColumnType("text");
                entity.Property(e => e.Macros).HasColumnType("text");
                entity.Property(e => e.Visibility).HasMaxLength(50).HasDefaultValue("private");
                entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnType("datetime");
            });

            modelBuilder.Entity<NutritionPlanItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.PlanId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.FoodItemId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.MealTime).HasMaxLength(50);
                entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.NutritionPlan)
                    .WithMany(p => p.Items)
                    .HasForeignKey(e => e.PlanId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.FoodItem)
                    .WithMany()
                    .HasForeignKey(e => e.FoodItemId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Exercise & Workout
            modelBuilder.Entity<ExerciseLibrary>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.Title).HasMaxLength(255).IsRequired();
                entity.Property(e => e.Description).HasColumnType("text");
                entity.Property(e => e.PrimaryMuscle).HasMaxLength(100);
                entity.Property(e => e.SecondaryMuscles).HasMaxLength(255);
                entity.Property(e => e.Equipment).HasMaxLength(255);
                entity.Property(e => e.Difficulty).HasMaxLength(50);
                entity.Property(e => e.VideoUrl).HasMaxLength(512);
                entity.Property(e => e.Images).HasColumnType("text");
                entity.Property(e => e.CreatedBy).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnType("datetime");
            });

            modelBuilder.Entity<ExerciseTag>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.ExerciseId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.Tag).HasMaxLength(100).IsRequired();

                entity.HasOne(e => e.Exercise)
                    .WithMany(ex => ex.Tags)
                    .HasForeignKey(e => e.ExerciseId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Workout>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.OwnerUserId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.Title).HasMaxLength(255).IsRequired();
                entity.Property(e => e.Description).HasColumnType("text");
                entity.Property(e => e.Intensity).HasMaxLength(50);
                entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnType("datetime");
            });

            modelBuilder.Entity<WorkoutExercise>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.WorkoutId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.ExerciseId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.Reps).HasMaxLength(50);
                entity.Property(e => e.Tempo).HasMaxLength(50);
                entity.Property(e => e.Notes).HasColumnType("text");

                entity.HasOne(e => e.Workout)
                    .WithMany(w => w.Exercises)
                    .HasForeignKey(e => e.WorkoutId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Exercise)
                    .WithMany()
                    .HasForeignKey(e => e.ExerciseId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<WorkoutSchedule>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.UserId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.WorkoutId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("planned");
                entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Workout)
                    .WithMany()
                    .HasForeignKey(e => e.WorkoutId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Progress & Challenges
            modelBuilder.Entity<ProgressEntry>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.UserId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.Type).HasMaxLength(50).IsRequired();
                entity.Property(e => e.TextValue).HasColumnType("text");
                entity.Property(e => e.PhotoUrl).HasMaxLength(512);
                entity.Property(e => e.RecordedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            modelBuilder.Entity<Challenge>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.Title).HasMaxLength(255).IsRequired();
                entity.Property(e => e.Description).HasColumnType("text");
                entity.Property(e => e.CreatedBy).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.Rules).HasColumnType("text");
                entity.Property(e => e.Reward).HasColumnType("text");
                entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnType("datetime");
            });

            modelBuilder.Entity<ChallengeParticipant>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.ChallengeId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.UserId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.Status).HasMaxLength(50).HasDefaultValue("active");
                entity.Property(e => e.Progress).HasColumnType("text");
                entity.Property(e => e.FinalResult).HasColumnType("text");
                entity.Property(e => e.JoinedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Challenge)
                    .WithMany(c => c.Participants)
                    .HasForeignKey(e => e.ChallengeId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Social Features
            modelBuilder.Entity<PostLike>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.PostId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.UserId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Post)
                    .WithMany()
                    .HasForeignKey(e => e.PostId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.PostId, e.UserId }).IsUnique();
            });

            modelBuilder.Entity<PostComment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.PostId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.UserId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.Content).HasColumnType("text").IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Post)
                    .WithMany()
                    .HasForeignKey(e => e.PostId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<PostVote>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.PostId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.UserId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.VoteType).IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Post)
                    .WithMany()
                    .HasForeignKey(e => e.PostId)
                    .OnDelete(DeleteBehavior.Cascade);

                // One vote per user per post
                entity.HasIndex(e => new { e.PostId, e.UserId }).IsUnique();
            });

            modelBuilder.Entity<UserFollower>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.UserId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.FollowerId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(e => new { e.UserId, e.FollowerId }).IsUnique();
            });

            // Communication
            modelBuilder.Entity<Message>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.ChannelId).HasColumnType("char(36)");
                entity.Property(e => e.SenderId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.Content).HasColumnType("text").IsRequired();
                entity.Property(e => e.ContentType).HasMaxLength(50);
                entity.Property(e => e.Attachments).HasColumnType("text");
                entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.ReviewerId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.TargetUserId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.Content).HasColumnType("text");
                entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnType("datetime");
            });

            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.UserId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.Title).HasMaxLength(255);
                entity.Property(e => e.Body).HasColumnType("text").IsRequired();
                entity.Property(e => e.Type).HasMaxLength(50);
                entity.Property(e => e.Data).HasColumnType("text");
                entity.Property(e => e.IsRead).HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.ReadAt).HasColumnType("datetime");
            });

            modelBuilder.Entity<UserSettings>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.UserId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.Preferences).HasColumnType("text");
                entity.Property(e => e.NotificationPrefs).HasColumnType("text");
                entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

                entity.HasIndex(e => e.UserId).IsUnique();
            });

            modelBuilder.Entity<StatsUserWeekly>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)");
                entity.Property(e => e.UserId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnType("datetime").HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // Achievement configuration
            modelBuilder.Entity<Achievement>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Category).HasMaxLength(50).IsRequired();
                entity.Property(e => e.BadgeIcon).HasMaxLength(10);
                entity.Property(e => e.Tier).HasMaxLength(20);
                entity.Property(e => e.Criteria).HasColumnType("text");
                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // UserAchievement configuration
            modelBuilder.Entity<UserAchievement>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.UserId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.AchievementId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.UnlockedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                // Relationships
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Achievement)
                    .WithMany()
                    .HasForeignKey(e => e.AchievementId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Prevent duplicate achievements
                entity.HasIndex(e => new { e.UserId, e.AchievementId }).IsUnique();
            });

            // Streak configuration
            modelBuilder.Entity<Streak>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.UserId).HasColumnType("char(36)").IsRequired();
                entity.Property(e => e.Type).HasMaxLength(50).IsRequired();
                entity.Property(e => e.LastActivityDate).HasColumnType("datetime");
                entity.Property(e => e.CreatedAt)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                // Relationships
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                // One streak per user per type
                entity.HasIndex(e => new { e.UserId, e.Type }).IsUnique();
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
