using Microsoft.EntityFrameworkCore;
using SmartNotes.API.Data;
using SmartNotes.API.Models;

namespace SmartNotes.API.Services;

public class FileService
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public FileService(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    public async Task<NoteAttachment?> UploadAsync(int noteId, int userId, IFormFile file)
    {
        var note = await _db.Notes.FirstOrDefaultAsync(n => n.Id == noteId && n.UserId == userId);
        if (note is null) return null;

        var uploadsPath = Path.Combine(_env.ContentRootPath, "Uploads");
        Directory.CreateDirectory(uploadsPath);

        var storedName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsPath, storedName);

        using var stream = File.Create(filePath);
        await file.CopyToAsync(stream);

        var attachment = new NoteAttachment
        {
            NoteId = noteId,
            FileName = file.FileName,
            StoredName = storedName,
            ContentType = file.ContentType,
            FileSize = file.Length
        };

        _db.NoteAttachments.Add(attachment);
        await _db.SaveChangesAsync();
        return attachment;
    }

    public async Task<(string path, string contentType, string fileName)?> DownloadAsync(int attachmentId, int userId)
    {
        var att = await _db.NoteAttachments
            .Include(a => a.Note)
            .FirstOrDefaultAsync(a => a.Id == attachmentId && a.Note.UserId == userId);

        if (att is null) return null;

        var filePath = Path.Combine(_env.ContentRootPath, "Uploads", att.StoredName);
        if (!File.Exists(filePath)) return null;

        return (filePath, att.ContentType, att.FileName);
    }

    public async Task<bool> DeleteAsync(int attachmentId, int userId)
    {
        var att = await _db.NoteAttachments
            .Include(a => a.Note)
            .FirstOrDefaultAsync(a => a.Id == attachmentId && a.Note.UserId == userId);

        if (att is null) return false;

        var filePath = Path.Combine(_env.ContentRootPath, "Uploads", att.StoredName);
        if (File.Exists(filePath)) File.Delete(filePath);

        _db.NoteAttachments.Remove(att);
        await _db.SaveChangesAsync();
        return true;
    }
}
