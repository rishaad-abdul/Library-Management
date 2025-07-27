namespace Library.Domain.Entities;

public class Account
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string Mobile { get; set; }
    public required string Department { get; set; }
    public DateTime DateOfBirth { get; set; }
}