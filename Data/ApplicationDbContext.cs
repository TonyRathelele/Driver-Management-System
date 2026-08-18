using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TakealotDriverManagementSystem.Models;

namespace TakealotDriverManagementSystem.Data;

public class ApplicationDbContext : IdentityDbContext<User>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Vacancy> Vacancies => Set<Vacancy>();
    public DbSet<JobApplication> Applications => Set<JobApplication>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Driver>(entity =>
        {
            entity.HasIndex(d => d.UserId).IsUnique();
            entity.Property(d => d.LicenseNumber).HasMaxLength(50).IsRequired();
            entity.HasOne(d => d.User).WithOne(u => u.Driver)
                .HasForeignKey<Driver>(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(d => d.AssignedVehicle).WithOne(v => v.Driver)
                .HasForeignKey<Vehicle>(v => v.DriverId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<Vehicle>(entity =>
        {
            entity.Property(v => v.Make).HasMaxLength(100).IsRequired();
            entity.Property(v => v.Model).HasMaxLength(100).IsRequired();
            entity.Property(v => v.LicensePlate).HasMaxLength(30).IsRequired();
            entity.HasOne(v => v.Warehouse).WithMany(w => w.Vehicles)
                .HasForeignKey(v => v.WarehouseId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<Vacancy>(entity =>
        {
            entity.Property(v => v.Name).HasMaxLength(150).IsRequired();
            entity.HasOne(v => v.Warehouse).WithMany(w => w.Vacancies)
                .HasForeignKey(v => v.WarehouseId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<JobApplication>(entity =>
        {
            entity.Property(a => a.Status).HasMaxLength(30).IsRequired();
            entity.HasOne(a => a.Vacancy).WithMany(v => v.Applications)
                .HasForeignKey(a => a.VacancyId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(a => a.User).WithMany(u => u.Applications)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Notification>(entity =>
        {
            entity.HasOne(n => n.User).WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
