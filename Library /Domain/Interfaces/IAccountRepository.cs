using Library.Domain.Entities;

namespace Library.Domain.Interfaces;

public interface IAccountRepository
{
    void Update(Account updated);
    Account? GetById(int userId);
}