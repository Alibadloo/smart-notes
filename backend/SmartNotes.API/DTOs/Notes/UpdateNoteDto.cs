namespace SmartNotes.API.DTOs.Notes;

public class UpdateNoteDto
{
    public string? Title { get; set; }
    public string? Content { get; set; }
    public int? CategoryId { get; set; }
    public List<string>? Tags { get; set; }
    public bool? IsPinned { get; set; }
}
