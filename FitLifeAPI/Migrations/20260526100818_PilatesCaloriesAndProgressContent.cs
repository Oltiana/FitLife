using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitLifeAPI.Migrations
{
    /// <inheritdoc />
    public partial class PilatesCaloriesAndProgressContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CaloriesBurned",
                table: "UserPilatesProgresses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EstimatedCalories",
                table: "PilatesWorkouts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "PilatesMotivationMessages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PilatesMotivationMessages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PilatesProgressPeriodSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Period = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SectionTitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TargetCalories = table.Column<int>(type: "int", nullable: true),
                    TargetMinutes = table.Column<int>(type: "int", nullable: true),
                    MinutesChartTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CaloriesChartTitle = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PilatesProgressPeriodSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PilatesProgressUiConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Subtitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MotivationLabel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DailyTargetsTitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DailyTargetsHint = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PilatesProgressUiConfigs", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PilatesMotivationMessages");

            migrationBuilder.DropTable(
                name: "PilatesProgressPeriodSettings");

            migrationBuilder.DropTable(
                name: "PilatesProgressUiConfigs");

            migrationBuilder.DropColumn(
                name: "CaloriesBurned",
                table: "UserPilatesProgresses");

            migrationBuilder.DropColumn(
                name: "EstimatedCalories",
                table: "PilatesWorkouts");
        }
    }
}
