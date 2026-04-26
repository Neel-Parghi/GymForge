using System;

namespace GymForge.Api.Middlewares
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class SkipResponseWrapperAttribute : Attribute
    {
    }
}
