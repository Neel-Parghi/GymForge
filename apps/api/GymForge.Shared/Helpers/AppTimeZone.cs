namespace GymForge.Shared.Helpers
{
    /// <summary>
    /// The business time zone (IST). Scheduled jobs run on IST wall-clock time, so anything that
    /// reasons about "today" must use it too - UtcNow.Date is still yesterday until 05:30 IST.
    /// </summary>
    public static class AppTimeZone
    {
        public static TimeZoneInfo India { get; } = Resolve();

        /// <summary>Today's calendar date in IST.</summary>
        public static DateTime Today => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, India).Date;

        /// <summary>
        /// The IST calendar date of a stored timestamp. Timestamps are stored in UTC, so an IST midnight
        /// (18:30 UTC the day before) maps back to the intended day; plain dates keep their day.
        /// </summary>
        public static DateTime ToLocalDate(DateTime value) =>
            value.Kind == DateTimeKind.Local
                ? value.Date
                : TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(value, DateTimeKind.Utc), India).Date;

        /// <summary>UTC bounds [start, end) of the given IST calendar day, for querying UTC timestamps.</summary>
        public static (DateTime StartUtc, DateTime EndUtc) DayBoundsUtc(DateTime localDate)
        {
            DateTime start = TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(localDate.Date, DateTimeKind.Unspecified), India);
            return (start, start.AddDays(1));
        }

        // IANA id on Linux/macOS, Windows id on Windows.
        private static TimeZoneInfo Resolve()
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("Asia/Kolkata");
            }
            catch (TimeZoneNotFoundException)
            {
                return TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            }
        }
    }
}
