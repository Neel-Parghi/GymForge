using System.Threading.Tasks;

namespace GymForge.Application.Modules.Dev.Interface
{
    public interface IDatabaseSeederService
    {
        Task SeedAsync();
    }
}
