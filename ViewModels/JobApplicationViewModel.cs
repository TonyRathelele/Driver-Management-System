using System.ComponentModel.DataAnnotations;

namespace TakealotDriverManagementSystem.ViewModels
{
    public class JobApplicationViewModel
    {
        [Required]
        public int VacancyId { get; set; }

        [Required]
        public string? VacancyTitle { get; set; }

        [Required]
        public string? FullName { get; set; }

        [Required]
        public string? LicenseNumber { get; set; }

        [Required]
        public IFormFile? ResumeUpload { get; set; }
    }
}
