using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymForge.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RefreshTokenTable_Add_GraceExpirationTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "GracePeriodExpires",
                table: "RefreshTokens",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GracePeriodExpires",
                table: "RefreshTokens");
        }
    }
}
