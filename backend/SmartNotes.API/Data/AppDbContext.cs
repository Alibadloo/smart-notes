using Microsoft.EntityFrameworkCore;
using SmartNotes.API.Models;

namespace SmartNotes.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<NoteVersion> NoteVersions => Set<NoteVersion>();
    public DbSet<NoteAttachment> NoteAttachments => Set<NoteAttachment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<Note>(e =>
        {
            e.Property(n => n.Status).HasConversion<string>();
            e.HasOne(n => n.User).WithMany(u => u.Notes).HasForeignKey(n => n.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(n => n.Category).WithMany(c => c.Notes).HasForeignKey(n => n.CategoryId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<NoteVersion>(e =>
        {
            e.HasOne(v => v.Note).WithMany(n => n.Versions).HasForeignKey(v => v.NoteId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<NoteAttachment>(e =>
        {
            e.HasOne(a => a.Note).WithMany(n => n.Attachments).HasForeignKey(a => a.NoteId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Category>(e =>
        {
            e.HasOne(c => c.User).WithMany(u => u.Categories).HasForeignKey(c => c.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
