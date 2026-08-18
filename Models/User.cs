using Microsoft.AspNetCore.Identity;

namespace TakealotDriverManagementSystem.Models;

public class User : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;

    public Driver? Driver { get; set; }
    public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
