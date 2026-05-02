using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitLifeAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddPilatesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PilatesPrograms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DurationWeeks = table.Column<int>(type: "int", nullable: false),
                    Level = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PilatesPrograms", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PilatesWorkouts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PilatesProgramId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PilatesWorkouts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PilatesWorkouts_PilatesPrograms_PilatesProgramId",
                        column: x => x.PilatesProgramId,
                        principalTable: "PilatesPrograms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserPilatesEnrollments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    PilatesProgramId = table.Column<int>(type: "int", nullable: false),
                    EnrolledAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPilatesEnrollments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserPilatesEnrollments_PilatesPrograms_PilatesProgramId",
                        column: x => x.PilatesProgramId,
                        principalTable: "PilatesPrograms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserPilatesEnrollments_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserPilatesProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    PilatesWorkoutId = table.Column<int>(type: "int", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPilatesProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserPilatesProgresses_PilatesWorkouts_PilatesWorkoutId",
                        column: x => x.PilatesWorkoutId,
                        principalTable: "PilatesWorkouts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserPilatesProgresses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PilatesWorkouts_PilatesProgramId",
                table: "PilatesWorkouts",
                column: "PilatesProgramId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPilatesEnrollments_PilatesProgramId",
                table: "UserPilatesEnrollments",
                column: "PilatesProgramId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPilatesEnrollments_UserId",
                table: "UserPilatesEnrollments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPilatesProgresses_PilatesWorkoutId",
                table: "UserPilatesProgresses",
                column: "PilatesWorkoutId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPilatesProgresses_UserId",
                table: "UserPilatesProgresses",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserPilatesEnrollments");

            migrationBuilder.DropTable(
                name: "UserPilatesProgresses");

            migrationBuilder.DropTable(
                name: "PilatesWorkouts");

            migrationBuilder.DropTable(
                name: "PilatesPrograms");
        }
    }
}
