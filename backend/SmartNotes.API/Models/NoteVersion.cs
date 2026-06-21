namespace SmartNotes.API.Models;

public class NoteVersion
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int VersionNumber { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int NoteId { get; set; }
    public Note Note { get; set; } = null!;
}
