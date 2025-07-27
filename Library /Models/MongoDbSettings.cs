namespace Library.Models;

public class MongoDbSettings
{
    public string ConnectionString { get; set; } = null!;
    public string DatabaseName { get; set; } = null!;
    public string BookCollectionName { get; set; } = "Books";
    public string LoanCollectionName { get; set; } = "Loans";
    public string StudentCollectionName { get; set; } = "Students";
}