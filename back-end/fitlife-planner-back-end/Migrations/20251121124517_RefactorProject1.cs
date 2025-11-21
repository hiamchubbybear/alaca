using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace fitlife_planner_back_end.Migrations
{
    /// <inheritdoc />
    public partial class RefactorProject1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<double>(
                name: "WeightKg",
                table: "BmiRecords",
                type: "double",
                nullable: false,
                oldClrType: typeof(float),
                oldType: "float");

            migrationBuilder.AlterColumn<double>(
                name: "HeightCm",
                table: "BmiRecords",
                type: "double",
                nullable: false,
                oldClrType: typeof(float),
                oldType: "float");

            migrationBuilder.AlterColumn<double>(
                name: "BMI",
                table: "BmiRecords",
                type: "double",
                nullable: false,
                oldClrType: typeof(float),
                oldType: "float");

            migrationBuilder.AddColumn<double>(
                name: "ActivityFactor",
                table: "BmiRecords",
                type: "double",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "PraticeLevel",
                table: "BmiRecords",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActivityFactor",
                table: "BmiRecords");

            migrationBuilder.DropColumn(
                name: "PraticeLevel",
                table: "BmiRecords");

            migrationBuilder.AlterColumn<float>(
                name: "WeightKg",
                table: "BmiRecords",
                type: "float",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "double");

            migrationBuilder.AlterColumn<float>(
                name: "HeightCm",
                table: "BmiRecords",
                type: "float",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "double");

            migrationBuilder.AlterColumn<float>(
                name: "BMI",
                table: "BmiRecords",
                type: "float",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "double");
        }
    }
}
