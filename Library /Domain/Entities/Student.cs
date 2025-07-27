using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Library.Domain.Entities;

public class Student
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;
    public required string Name { get; set; }
    public required string Role { get; set; }
    public string Email { get; set; } = "";
    public required string Username { get; set; }
    public int PhoneNumber { get; set; }
    public string Address { get; set; } = "";
}