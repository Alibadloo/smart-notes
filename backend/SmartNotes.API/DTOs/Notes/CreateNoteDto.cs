using System.ComponentModel.DataAnnotations;

namespace SmartNotes.API.DTOs.Notes;

public class CreateNoteDto
{
    [Required, MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public List<string> Tags { get; set; } = new();
    public bool IsPinned { get; set; } = false;
}
