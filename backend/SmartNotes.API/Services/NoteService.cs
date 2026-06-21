using Microsoft.EntityFrameworkCore;
using SmartNotes.API.Data;
using SmartNotes.API.DTOs.Notes;
using SmartNotes.API.Interfaces;
using SmartNotes.API.Models;

namespace SmartNotes.API.Services;

public class NoteService : INoteService
{
    private readonly AppDbContext _db;

    public NoteService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<NoteDto>> GetAllAsync(int userId, string? search, int? categoryId, string? status)
    {
        var query = _db.Notes
            .Include(n => n.Category)
            .Include(n => n.Attachments)
            .Include(n => n.Versions)
            .Where(n => n.UserId == userId);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(n => n.Title.Contains(search) || n.Content.Contains(search));

        if (categoryId.HasValue)
            query = query.Where(n => n.CategoryId == categoryId);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<NoteStatus>(status, true, out var noteStatus))
            query = query.Where(n => n.Status == noteStatus);
        else
            query = query.Where(n => n.Status != NoteStatus.Deleted);

        return await query
            .OrderByDescending(n => n.IsPinned)
            .ThenByDescending(n => n.UpdatedAt)
            .Select(n => MapToDto(n))
            .ToListAsync();
    }

    public async Task<NoteDto?> GetByIdAsync(int id, int userId)
    {
        var note = await _db.Notes
            .Include(n => n.Category)
            .Include(n => n.Attachments)
            .Include(n => n.Versions)
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        return note is null ? null : MapToDto(note);
    }

    public async Task<NoteDto> CreateAsync(CreateNoteDto dto, int userId)
    {
        var note = new Note
        {
            Title = dto.Title,
            Content = dto.Content,
            CategoryId = dto.CategoryId,
            Tags = string.Join(",", dto.Tags),
            IsPinned = dto.IsPinned,
            UserId = userId
        };

        _db.Notes.Add(note);
        await _db.SaveChangesAsync();

        await SaveVersionAsync(note);

        return await GetByIdAsync(note.Id, userId) ?? MapToDto(note);
    }

    public async Task<NoteDto?> UpdateAsync(int id, UpdateNoteDto dto, int userId)
    {
        var note = await _db.Notes.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
        if (note is null) return null;

        if (dto.Title is not null) note.Title = dto.Title;
        if (dto.Content is not null) note.Content = dto.Content;
        if (dto.CategoryId.HasValue) note.CategoryId = dto.CategoryId;
        if (dto.Tags is not null) note.Tags = string.Join(",", dto.Tags);
        if (dto.IsPinned.HasValue) note.IsPinned = dto.IsPinned.Value;
        note.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await SaveVersionAsync(note);

        return await GetByIdAsync(note.Id, userId);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var note = await _db.Notes.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
        if (note is null) return false;

        note.Status = NoteStatus.Deleted;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ArchiveAsync(int id, int userId)
    {
        var note = await _db.Notes.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
        if (note is null) return false;

        note.Status = note.Status == NoteStatus.Archived ? NoteStatus.Active : NoteStatus.Archived;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<NoteVersion>> GetVersionsAsync(int noteId, int userId)
    {
        var exists = await _db.Notes.AnyAsync(n => n.Id == noteId && n.UserId == userId);
        if (!exists) return Enumerable.Empty<NoteVersion>();

        return await _db.NoteVersions
            .Where(v => v.NoteId == noteId)
            .OrderByDescending(v => v.VersionNumber)
            .ToListAsync();
    }

    private async Task SaveVersionAsync(Note note)
    {
        var versionCount = await _db.NoteVersions.CountAsync(v => v.NoteId == note.Id);
        _db.NoteVersions.Add(new NoteVersion
        {
            NoteId = note.Id,
            Title = note.Title,
            Content = note.Content,
            VersionNumber = versionCount + 1
        });
        await _db.SaveChangesAsync();
    }

    private static NoteDto MapToDto(Note n) => new()
    {
        Id = n.Id,
        Title = n.Title,
        Content = n.Content,
        Status = n.Status.ToString(),
        IsPinned = n.IsPinned,
        Tags = string.IsNullOrEmpty(n.Tags) ? [] : [.. n.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries)],
        CategoryId = n.CategoryId,
        CategoryName = n.Category?.Name,
        CategoryColor = n.Category?.Color,
        CreatedAt = n.CreatedAt,
        UpdatedAt = n.UpdatedAt,
        AttachmentCount = n.Attachments?.Count ?? 0,
        VersionCount = n.Versions?.Count ?? 0
    };
}
