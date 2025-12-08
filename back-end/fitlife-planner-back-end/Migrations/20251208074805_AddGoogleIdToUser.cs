using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace fitlife_planner_back_end.Migrations
{
    /// <inheritdoc />
    public partial class AddGoogleIdToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GoogleId",
                table: "Users",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "ChallengeParticipants",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChallengeParticipants_UserId",
                table: "ChallengeParticipants",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChallengeParticipants_Users_UserId",
                table: "ChallengeParticipants",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChallengeParticipants_Users_UserId",
                table: "ChallengeParticipants");

            migrationBuilder.DropIndex(
                name: "IX_ChallengeParticipants_UserId",
                table: "ChallengeParticipants");

            migrationBuilder.DropColumn(
                name: "GoogleId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "ChallengeParticipants");
        }
    }
}
