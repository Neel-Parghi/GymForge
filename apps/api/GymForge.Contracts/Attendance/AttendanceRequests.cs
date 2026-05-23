using GymForge.Contracts.Common;
using System;

namespace GymForge.Contracts.Attendance
{
    public record CheckInRequest(Guid MemberId, string Method = "Manual");
    public record CheckOutRequest(Guid MemberId);

    public class AttendanceLogQueryParams : PaginationParams
    {
        public string? Status { get; set; }
        public DateTime? Date { get; set; }
    }
}
