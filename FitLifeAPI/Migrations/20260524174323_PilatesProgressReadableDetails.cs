using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitLifeAPI.Migrations
{
    /// <inheritdoc />
    public partial class PilatesProgressReadableDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExercisesCompleted",
                table: "UserPilatesProgresses",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ProgramName",
                table: "UserPilatesProgresses",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "WorkoutName",
                table: "UserPilatesProgresses",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExercisesCompleted",
                table: "UserPilatesProgresses");

            migrationBuilder.DropColumn(
                name: "ProgramName",
                table: "UserPilatesProgresses");

            migrationBuilder.DropColumn(
                name: "WorkoutName",
                table: "UserPilatesProgresses");
        }
    }
}
