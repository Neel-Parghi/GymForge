using GymForge.Domain.Entities;

namespace GymForge.Domain.Interface
{
    public interface IAddressRepository
    {
        Task AddAsync(Address address);
        Task Update(Address address);
        Task<Address?> GetByIdAsync(Guid id);
    }
}
