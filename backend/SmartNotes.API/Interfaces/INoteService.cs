using SmartNotes.API.DTOs.Notes;
using SmartNotes.API.Models;

namespace SmartNotes.API.Interfaces;

public interface INoteService
{
    Task<IEnumerable<NoteDto>> GetAllAsync(int userId, string? search, int? categoryId, string? status);
    Task<NoteDto?> GetByIdAsync(int id, int userId);
    Task<NoteDto> CreateAsync(CreateNoteDto dto, int userId);
    Task<NoteDto?> UpdateAsync(int id, UpdateNoteDto dto, int userId);
    Task<bool> DeleteAsync(int id, int userId);
    Task<bool> ArchiveAsync(int id, int userId);
    Task<IEnumerable<NoteVersion>> GetVersionsAsync(int noteId, int userId);
}
