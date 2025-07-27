using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Library.Domain.Entities;

public class Book
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? MongoId { get; set; }  // MongoDB internal ID
    public int BookId { get; set; }
    public string UserId { get; set; } = "";
    public string Title { get; set; } = "";
    public string Author { get; set; } = "";
    public string Genre { get; set; } = "";
    public string ISBN { get; set; } = "";
    public string Domain { get; set; } = "";
}