using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymForge.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddStrategicTargetsToConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "MonthlyRevenueTarget",
                table: "SaaSConfigurations",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "SubscriptionTarget",
                table: "SaaSConfigurations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "UptimeThreshold",
                table: "SaaSConfigurations",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.UpdateData(
                table: "SaaSConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"),
                columns: new[] { "MonthlyRevenueTarget", "PlatformName", "SubscriptionTarget", "UptimeThreshold" },
                values: new object[] { 100000.0m, "GymForge", 100, 99.9m });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MonthlyRevenueTarget",
                table: "SaaSConfigurations");

            migrationBuilder.DropColumn(
                name: "SubscriptionTarget",
                table: "SaaSConfigurations");

            migrationBuilder.DropColumn(
                name: "UptimeThreshold",
                table: "SaaSConfigurations");

            migrationBuilder.UpdateData(
                table: "SaaSConfigurations",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"),
                column: "PlatformName",
                value: "GymForge SaaS");
        }
    }
}
