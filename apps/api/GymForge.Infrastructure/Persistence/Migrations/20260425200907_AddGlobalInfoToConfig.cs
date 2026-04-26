using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymForge.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGlobalInfoToConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsMaintenanceMode",
                table: "SaaSConfigurations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PrivacyUrl",
                table: "SaaSConfigurations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SupportEmail",
                table: "SaaSConfigurations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TermsUrl",
                table: "SaaSConfigurations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "SaaSConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"),
                columns: new[] { "IsMaintenanceMode", "PrivacyUrl", "SupportEmail", "TermsUrl" },
                values: new object[] { false, null, null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsMaintenanceMode",
                table: "SaaSConfigurations");

            migrationBuilder.DropColumn(
                name: "PrivacyUrl",
                table: "SaaSConfigurations");

            migrationBuilder.DropColumn(
                name: "SupportEmail",
                table: "SaaSConfigurations");

            migrationBuilder.DropColumn(
                name: "TermsUrl",
                table: "SaaSConfigurations");
        }
    }
}
