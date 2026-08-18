namespace TakealotDriverManagementSystem.Models;

public class Vacancy
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public int? WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
}
