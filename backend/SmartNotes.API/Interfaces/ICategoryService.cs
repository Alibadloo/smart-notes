using SmartNotes.API.DTOs.Categories;

namespace SmartNotes.API.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllAsync(int userId);
    Task<CategoryDto?> GetByIdAsync(int id, int userId);
    Task<CategoryDto> CreateAsync(CreateCategoryDto dto, int userId);
    Task<CategoryDto?> UpdateAsync(int id, CreateCategoryDto dto, int userId);
    Task<bool> DeleteAsync(int id, int userId);
}
