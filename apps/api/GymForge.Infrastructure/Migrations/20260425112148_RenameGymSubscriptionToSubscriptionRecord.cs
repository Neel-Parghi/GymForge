using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymForge.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameGymSubscriptionToSubscriptionRecord : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "GymSubscriptions",
                newName: "SubscriptionRecords");

            migrationBuilder.RenameIndex(
                name: "IX_GymSubscriptions_GymId",
                table: "SubscriptionRecords",
                newName: "IX_SubscriptionRecords_GymId");

            migrationBuilder.RenameIndex(
                name: "IX_GymSubscriptions_PlanId",
                table: "SubscriptionRecords",
                newName: "IX_SubscriptionRecords_PlanId");

            migrationBuilder.DropForeignKey(
                name: "FK_GymSubscriptions_Gyms_GymId",
                table: "SubscriptionRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_GymSubscriptions_Plans_PlanId",
                table: "SubscriptionRecords");

            migrationBuilder.AddForeignKey(
                name: "FK_SubscriptionRecords_Gyms_GymId",
                table: "SubscriptionRecords",
                column: "GymId",
                principalTable: "Gyms",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_SubscriptionRecords_Plans_PlanId",
                table: "SubscriptionRecords",
                column: "PlanId",
                principalTable: "Plans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.DropForeignKey(
                name: "FK_SaaSPaymentTransactions_GymSubscriptions_SubscriptionId",
                table: "SaaSPaymentTransactions");

            migrationBuilder.AddForeignKey(
                name: "FK_SaaSPaymentTransactions_SubscriptionRecords_SubscriptionId",
                table: "SaaSPaymentTransactions",
                column: "SubscriptionId",
                principalTable: "SubscriptionRecords",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "SubscriptionRecords",
                newName: "GymSubscriptions");

            migrationBuilder.RenameIndex(
                name: "IX_SubscriptionRecords_GymId",
                table: "GymSubscriptions",
                newName: "IX_GymSubscriptions_GymId");

            migrationBuilder.RenameIndex(
                name: "IX_SubscriptionRecords_PlanId",
                table: "GymSubscriptions",
                newName: "IX_GymSubscriptions_PlanId");

            migrationBuilder.DropForeignKey(
                name: "FK_SubscriptionRecords_Gyms_GymId",
                table: "GymSubscriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_SubscriptionRecords_Plans_PlanId",
                table: "GymSubscriptions");

            migrationBuilder.AddForeignKey(
                name: "FK_GymSubscriptions_Gyms_GymId",
                table: "GymSubscriptions",
                column: "GymId",
                principalTable: "Gyms",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

            migrationBuilder.AddForeignKey(
                name: "FK_GymSubscriptions_Plans_PlanId",
                table: "GymSubscriptions",
                column: "PlanId",
                principalTable: "Plans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.DropForeignKey(
                name: "FK_SaaSPaymentTransactions_SubscriptionRecords_SubscriptionId",
                table: "SaaSPaymentTransactions");

            migrationBuilder.AddForeignKey(
                name: "FK_SaaSPaymentTransactions_GymSubscriptions_SubscriptionId",
                table: "SaaSPaymentTransactions",
                column: "SubscriptionId",
                principalTable: "GymSubscriptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);
        }
    }
}
