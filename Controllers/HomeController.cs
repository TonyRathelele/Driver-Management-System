using Microsoft.AspNetCore.Mvc;

namespace TakealotDriverManagementSystem.Controllers;

public class HomeController : Controller
{
    public IActionResult Index() => View();
}
