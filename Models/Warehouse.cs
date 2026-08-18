namespace TakealotDriverManagementSystem.Models;

public class Warehouse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    public ICollection<Vacancy> Vacancies { get; set; } = new List<Vacancy>();
}
