namespace TakealotDriverManagementSystem.Models;

public class JobApplication
{
    public int Id { get; set; }
    public int VacancyId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string ResumePath { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public DateTime DateSubmitted { get; set; }

    public Vacancy? Vacancy { get; set; }
    public User? User { get; set; }
}
