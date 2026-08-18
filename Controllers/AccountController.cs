using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TakealotDriverManagementSystem.Models;

namespace TakealotDriverManagementSystem.Controllers;

public class AccountController : Controller
{
    private readonly SignInManager<User> _signInManager;

    public AccountController(SignInManager<User> signInManager) => _signInManager = signInManager;

    [HttpGet]
    public IActionResult Login(string? returnUrl = null)
    {
        ViewBag.ReturnUrl = returnUrl;
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(string email, string password, string? returnUrl = null)
    {
        var result = await _signInManager.PasswordSignInAsync(email, password, false, false);
        if (result.Succeeded)
            return LocalRedirect(returnUrl ?? Url.Action("Dashboard", "Driver")!);

        ModelState.AddModelError(string.Empty, "Invalid email or password.");
        ViewBag.ReturnUrl = returnUrl;
        return View();
    }

    [HttpGet]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return RedirectToAction("Login");
    }
}
