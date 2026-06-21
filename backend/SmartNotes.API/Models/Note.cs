namespace SmartNotes.API.Models;

public enum NoteStatus
{
    Active,
    Archived,
    Deleted
}

public class Note
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public NoteStatus Status { get; set; } = NoteStatus.Active;
    public bool IsPinned { get; set; } = false;
    public string Tags { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int? CategoryId { get; set; }
    public Category? Category { get; set; }

    public ICollection<NoteVersion> Versions { get; set; } = new List<NoteVersion>();
    public ICollection<NoteAttachment> Attachments { get; set; } = new List<NoteAttachment>();
}
