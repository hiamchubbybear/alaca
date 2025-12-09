using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace fitlife_planner_back_end.Migrations
{
    /// <inheritdoc />
    public partial class AddSessionBasedScheduling : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SessionName",
                table: "WorkoutSchedules",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "SessionNumber",
                table: "WorkoutSchedules",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "WeekNumber",
                table: "WorkoutSchedules",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ScheduledExercises",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ScheduleId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ExerciseId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    Sets = table.Column<int>(type: "int", nullable: false),
                    Reps = table.Column<int>(type: "int", nullable: false),
                    RestSeconds = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScheduledExercises", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ScheduledExercises_ExerciseLibrary_ExerciseId",
                        column: x => x.ExerciseId,
                        principalTable: "ExerciseLibrary",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ScheduledExercises_WorkoutSchedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "WorkoutSchedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledExercises_ExerciseId",
                table: "ScheduledExercises",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_ScheduledExercises_ScheduleId",
                table: "ScheduledExercises",
                column: "ScheduleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ScheduledExercises");

            migrationBuilder.DropColumn(
                name: "SessionName",
                table: "WorkoutSchedules");

            migrationBuilder.DropColumn(
                name: "SessionNumber",
                table: "WorkoutSchedules");

            migrationBuilder.DropColumn(
                name: "WeekNumber",
                table: "WorkoutSchedules");
        }
    }
}
