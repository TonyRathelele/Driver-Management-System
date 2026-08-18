# Driver Management System

ASP.NET Core MVC application for driver vacancies, applications, vehicles, profiles and notifications.

## Requirements

- .NET 10 SDK
- VS Code + C# Dev Kit

## Run

Open the project folder in VS Code and run:

```powershell
dotnet restore
dotnet build
dotnet run
```

Open `http://localhost:5200` or the URL printed by `dotnet run`.

The application uses SQLite and creates `takealot-drivers.db` automatically on first run.

## Demo driver

- Email: `driver@takealot.local`
- Password: `Driver123`

## What was repaired

- Added Entity Framework Core SQLite and ASP.NET Core Identity packages.
- Added the missing User, Driver, Vehicle, Warehouse, Vacancy, JobApplication and Notification models.
- Added `ApplicationDbContext`.
- Added Identity and cookie authentication configuration.
- Added database seeding with a driver, vehicle, warehouse, vacancies and notification.
- Added a simple driver login/logout flow.
- Added missing Dashboard and Vacancy Details views.
- Fixed the driver layout notification link and profile cancel link.
- Added static assets under `wwwroot`.
