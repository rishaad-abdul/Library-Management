using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Library.Domain.Entities;

public class Loan
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? MongoId { get; set; }
    public int LoanId { get; set; }
    public required string UserId { get; set; }
    public required string PersonName { get; set; }
    public required string StudentId { get; set; }
    public int BookId { get; set; }
    public string BookName { get; set; } = "";
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public decimal PricePerDay { get; set; }
    public bool IsCleared { get; set; }

    public int Days => (ToDate - FromDate).Days;
    public decimal Amount => Days * PricePerDay;
}