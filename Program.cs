using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TakealotDriverManagementSystem.Data;
using TakealotDriverManagementSystem.Models;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=takealot-drivers.db";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequiredLength = 6;
    options.Password.RequireDigit = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireNonAlphanumeric = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Account/Login";
    options.AccessDeniedPath = "/Account/Login";
});

builder.Services.AddControllersWithViews();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

await SeedDatabaseAsync(app);

app.Run();

static async Task SeedDatabaseAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ApplicationDbContext>();
    var userManager = services.GetRequiredService<UserManager<User>>();
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

    await context.Database.EnsureCreatedAsync();

    const string roleName = "Driver";
    if (!await roleManager.RoleExistsAsync(roleName))
        await roleManager.CreateAsync(new IdentityRole(roleName));

    const string adminRole = "Administrator";
    if (!await roleManager.RoleExistsAsync(adminRole))
        await roleManager.CreateAsync(new IdentityRole(adminRole));

    const string driverEmail = "driver@takealot.local";
    const string driverPassword = "Driver123";

    var user = await userManager.FindByEmailAsync(driverEmail);
    if (user == null)
    {
        user = new User
        {
            UserName = driverEmail,
            Email = driverEmail,
            EmailConfirmed = true,
            FirstName = "Demo",
            LastName = "Driver",
            ContactNumber = "0712345678",
            Address = "Cape Town, South Africa"
        };

        var result = await userManager.CreateAsync(user, driverPassword);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));

        await userManager.AddToRoleAsync(user, roleName);
    }

    if (!context.Drivers.Any(d => d.UserId == user.Id))
    {
        var warehouse = await context.Warehouses.FirstOrDefaultAsync();
        if (warehouse == null)
        {
            warehouse = new Warehouse
            {
                Name = "Cape Town Distribution Centre",
                Address = "Montague Gardens, Cape Town"
            };
            context.Warehouses.Add(warehouse);
            await context.SaveChangesAsync();
        }

        var vehicle = new Vehicle
        {
            Make = "Toyota",
            Model = "Quantum",
            LicensePlate = "CA 123-456",
            WarehouseId = warehouse.Id
        };
        context.Vehicles.Add(vehicle);
        await context.SaveChangesAsync();

        var driver = new Driver
        {
            UserId = user.Id,
            LicenseNumber = "DRIVER-12345",
            AssignedVehicleId = vehicle.Id
        };

        context.Drivers.Add(driver);
        await context.SaveChangesAsync();

        vehicle.DriverId = driver.Id;
        await context.SaveChangesAsync();
    }

    if (!context.Vacancies.Any())
    {
        var warehouse = await context.Warehouses.FirstAsync();
        context.Vacancies.AddRange(
            new Vacancy
            {
                Name = "Delivery Driver",
                Description = "Deliver customer orders safely and on time while maintaining excellent service standards.",
                WarehouseId = warehouse.Id
            },
            new Vacancy
            {
                Name = "Driver - Distribution",
                Description = "Support daily distribution operations, vehicle checks and scheduled deliveries.",
                WarehouseId = warehouse.Id
            });
        await context.SaveChangesAsync();
    }

    if (!context.Notifications.Any(n => n.UserId == user.Id))
    {
        context.Notifications.Add(new Notification
        {
            UserId = user.Id,
            Message = "Welcome to the Takealot Driver Management System.",
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        });
        await context.SaveChangesAsync();
    }
}
