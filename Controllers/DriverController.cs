using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TakealotDriverManagementSystem.Data;
using TakealotDriverManagementSystem.Models;
using TakealotDriverManagementSystem.ViewModels;

namespace TakealotDriverManagementSystem.Controllers
{
    [Authorize(Roles = "Driver")]
    public class DriverController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public DriverController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: Driver/Dashboard
        public async Task<IActionResult> Dashboard()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return NotFound();
            }

            var driver = await _context.Drivers
                .Include(d => d.AssignedVehicle)
                .ThenInclude(v => v.Warehouse)
                .FirstOrDefaultAsync(d => d.UserId == userId);

            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .OrderByDescending(n => n.CreatedAt)
                .Take(5)
                .ToListAsync();

            var viewModel = new DriverDashboardViewModel
            {
                Driver = driver,
                User = user,
                Notifications = notifications
            };

            return View(viewModel);
        }

        // GET: Driver/Profile
        public async Task<IActionResult> Profile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return NotFound();
            }

            var driver = await _context.Drivers
                .Include(d => d.AssignedVehicle)
                .FirstOrDefaultAsync(d => d.UserId == userId);

            var viewModel = new DriverProfileViewModel
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                ContactNumber = user.ContactNumber,
                Email = user.Email,
                LicenseNumber = driver.LicenseNumber,
                Address = user.Address
            };

            return View(viewModel);
        }

        // POST: Driver/UpdateProfile
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateProfile(DriverProfileViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View("Profile", model);
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return NotFound();
            }

            // Update user details
            user.FirstName = model.FirstName;
            user.LastName = model.LastName;
            user.Address = model.Address;
            user.ContactNumber = model.ContactNumber;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }
                return View("Profile", model);
            }

            // Update driver details if they exist
            var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.UserId == userId);
            if (driver != null)
            {
                driver.LicenseNumber = model.LicenseNumber;
                _context.Update(driver);
                await _context.SaveChangesAsync();
            }

            TempData["SuccessMessage"] = "Profile updated successfully!";
            return RedirectToAction(nameof(Profile));
        }

        // GET: Driver/VehicleDetails
        public async Task<IActionResult> VehicleDetails()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var driver = await _context.Drivers
                .Include(d => d.AssignedVehicle)
                .ThenInclude(v => v.Warehouse)
                .FirstOrDefaultAsync(d => d.UserId == userId);

            if (driver?.AssignedVehicle == null)
            {
                TempData["AssignedVehicle"] = "False";
                return View();
            }

            return View(driver.AssignedVehicle);
        }

        // GET: Driver/Vacancies
        public async Task<IActionResult> Vacancies()
        {
            var vacancies = await _context.Vacancies
                .Include(v => v.Warehouse)
                .Where(v => v.Applications.All(a => a.UserId != User.FindFirstValue(ClaimTypes.NameIdentifier)))
                .ToListAsync();

            return View(vacancies);
        }

        // GET: Driver/VacancyDetails/5
        public async Task<IActionResult> VacancyDetails(int id)
        {
            var vacancy = await _context.Vacancies
                .Include(v => v.Warehouse)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (vacancy == null)
            {
                return NotFound();
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var hasApplied = await _context.Applications
                .AnyAsync(a => a.VacancyId == id && a.UserId == userId);

            var viewModel = new VacancyDetailsViewModel
            {
                Vacancy = vacancy,
                HasApplied = hasApplied
            };

            return View(viewModel);
        }

        // GET: Driver/Apply/5
        public async Task<IActionResult> Apply(int id)
        {
            var vacancy = await _context.Vacancies.FindAsync(id);
            if (vacancy == null)
            {
                return NotFound();
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var hasApplied = await _context.Applications
                .AnyAsync(a => a.VacancyId == id && a.UserId == userId);

            if (hasApplied)
            {
                TempData["ErrorMessage"] = "You have already applied for this vacancy.";
                return RedirectToAction(nameof(VacancyDetails), new { id });
            }

            var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.UserId == userId);
            var user = await _userManager.FindByIdAsync(userId);

            var viewModel = new JobApplicationViewModel
            {
                VacancyId = id,
                VacancyTitle = vacancy.Name,
                LicenseNumber = driver?.LicenseNumber ?? "",
                FullName = $"{user?.FirstName} {user?.LastName}"
            };

            return View(viewModel);
        }

        // POST: Driver/Apply
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Apply(JobApplicationViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Check if already applied
            var hasApplied = await _context.Applications
                .AnyAsync(a => a.VacancyId == model.VacancyId && a.UserId == userId);

            if (hasApplied)
            {
                TempData["ErrorMessage"] = "You have already applied for this vacancy.";
                return RedirectToAction(nameof(VacancyDetails), new { id = model.VacancyId });
            }

            // Validate file server-side
            if (model.ResumeUpload == null || model.ResumeUpload.Length == 0)
            {
                ModelState.AddModelError("ResumeUpload", "Please upload your resume.");
                return View(model);
            }

            if (Path.GetExtension(model.ResumeUpload.FileName).ToLower() != ".pdf")
            {
                ModelState.AddModelError("ResumeUpload", "Only PDF files are allowed.");
                return View(model);
            }

            if (model.ResumeUpload.Length > 5 * 1024 * 1024)
            {
                ModelState.AddModelError("ResumeUpload", "File size cannot exceed 5MB.");
                return View(model);
            }

            // File upload
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "resumes");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{userId}_{Guid.NewGuid()}{Path.GetExtension(model.ResumeUpload.FileName)}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await model.ResumeUpload.CopyToAsync(fileStream);
            }

            var resumePath = $"/resumes/{uniqueFileName}";

            // Create Job Application
            var application = new JobApplication
            {
                VacancyId = model.VacancyId,
                UserId = userId,
                LicenseNumber = model.LicenseNumber,
                ResumePath = resumePath,
                Status = "Pending",
                DateSubmitted = DateTime.UtcNow
            };

            // Create Driver Notification
            var driverNotification = new Notification
            {
                UserId = userId,
                Message = $"Your application for {model.VacancyTitle} has been submitted successfully.",
                CreatedAt = DateTime.UtcNow
            };

            // Get Admin Users
            var admins = await _userManager.GetUsersInRoleAsync("Administrator");
            var adminNotifications = admins.Select(admin => new Notification
            {
                UserId = admin.Id,
                Message = $"A new driver application has been submitted for {model.VacancyTitle}.<br>" +
                          $"Applicant: {model.FullName}.<br>Application Date: {DateTime.UtcNow:yyyy-MM-dd HH:mm}",
                CreatedAt = DateTime.UtcNow
            }).ToList();

            // Save 
            _context.Applications.Add(application);
            _context.Notifications.Add(driverNotification);
            _context.Notifications.AddRange(adminNotifications);
            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = "Application submitted successfully!";
            return RedirectToAction(nameof(JobApplications));
        }


        // GET: Driver/JobApplications
        public async Task<IActionResult> JobApplications()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var applications = await _context.Applications
                .Include(a => a.Vacancy)
                .ThenInclude(v => v.Warehouse)
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.DateSubmitted)
                .ToListAsync();

            if (applications == null || applications.Count == 0)
            {
                ViewBag.ShowBrowseButton = true;
            }
            return View(applications);
        }

        // GET: Driver/ApplicationDetails/5
        public async Task<IActionResult> ApplicationDetails(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var application = await _context.Applications
                .Include(a => a.Vacancy)
                .ThenInclude(v => v.Warehouse)
                .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

            if (application == null)
            {
                return NotFound();
            }

            return View(application);
        }

        // GET: Driver/Notifications
        public async Task<IActionResult> Notifications()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();


            await _context.SaveChangesAsync();

            return View(notifications);
        }

        public async Task<IActionResult> NotificationDetails(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification == null)
                return NotFound();

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                await _context.SaveChangesAsync();
            }

            return View(notification);
        }

        // POST: Driver/DeleteNotification/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (notification == null)
            {
                return NotFound();
            }

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = "Notification deleted successfully.";
            return RedirectToAction(nameof(Notifications));
        }
    }
}

