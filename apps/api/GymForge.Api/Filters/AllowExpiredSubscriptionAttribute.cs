using System;

namespace GymForge.Api.Filters
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AllowExpiredSubscriptionAttribute : Attribute
    {
    }
}
