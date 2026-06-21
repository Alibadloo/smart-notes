using System.ComponentModel.DataAnnotations;

namespace SmartNotes.API.DTOs.Categories;

public class CreateCategoryDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [RegularExpression("^#[0-9A-Fa-f]{6}$")]
    public string Color { get; set; } = "#6366F1";

    public string Icon { get; set; } = "folder";
}
