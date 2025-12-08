using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace fitlife_planner_back_end.Migrations
{
    /// <inheritdoc />
    public partial class AddExerciseRecommendationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CaloriesBurnedPerSet",
                table: "ExerciseLibrary",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Instructions",
                table: "ExerciseLibrary",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "RecommendedReps",
                table: "ExerciseLibrary",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "RecommendedSets",
                table: "ExerciseLibrary",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "RestSeconds",
                table: "ExerciseLibrary",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Tags",
                table: "ExerciseLibrary",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CaloriesBurnedPerSet",
                table: "ExerciseLibrary");

            migrationBuilder.DropColumn(
                name: "Instructions",
                table: "ExerciseLibrary");

            migrationBuilder.DropColumn(
                name: "RecommendedReps",
                table: "ExerciseLibrary");

            migrationBuilder.DropColumn(
                name: "RecommendedSets",
                table: "ExerciseLibrary");

            migrationBuilder.DropColumn(
                name: "RestSeconds",
                table: "ExerciseLibrary");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "ExerciseLibrary");
        }
    }
}
