using TakealotDriverManagementSystem.Models;

namespace TakealotDriverManagementSystem.ViewModels
{
    public class DriverDashboardViewModel
    {
        public User User { get; set; }
        public Driver Driver { get; set; }
        public List<Notification> Notifications { get; set; }
    }
}
