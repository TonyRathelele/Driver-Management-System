namespace TakealotDriverManagementSystem.Models;

public class Driver
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;

    public User? User { get; set; }
    public int? AssignedVehicleId { get; set; }
    public Vehicle? AssignedVehicle { get; set; }
}
