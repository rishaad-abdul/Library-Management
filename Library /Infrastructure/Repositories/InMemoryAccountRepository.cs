using Library.Domain.Entities;
using Library.Domain.Interfaces;

namespace Library.Infrastructure.Repositories;

public class InMemoryAccountRepository : IAccountRepository
{
    private readonly List<Account> _accounts = new()
    {
        new Account
        {
            Id = 1,
            Name = "Rishaad",
            Email = "rishaad@example.com",
            Mobile = "9876543210",
            Department = "Computer Science",
            DateOfBirth = new DateTime(2000, 1, 1)
        },
        new Account
        {
            Id = 2,
            Name = "Admin User",
            Email = "admin@example.com",
            Mobile = "1234567890",
            Department = "Admin Department",
            DateOfBirth = new DateTime(1990, 5, 10)
        }
    };

    public Account? GetById(int id) => _accounts.FirstOrDefault(a => a.Id == id);

    public void Update(Account updated)
    {
        var existing = _accounts.FirstOrDefault(a => a.Id == updated.Id);
        if (existing == null) return;

        existing.Name = updated.Name;
        existing.Email = updated.Email;
        existing.Mobile = updated.Mobile;
        existing.Department = updated.Department;
        existing.DateOfBirth = updated.DateOfBirth;
    }
}