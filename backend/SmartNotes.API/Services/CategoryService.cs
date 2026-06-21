using Microsoft.EntityFrameworkCore;
using SmartNotes.API.Data;
using SmartNotes.API.DTOs.Categories;
using SmartNotes.API.Interfaces;
using SmartNotes.API.Models;

namespace SmartNotes.API.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _db;

    public CategoryService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<CategoryDto>> GetAllAsync(int userId)
    {
        return await _db.Categories
            .Where(c => c.UserId == userId)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Color = c.Color,
                Icon = c.Icon,
                IsDefault = c.IsDefault,
                NoteCount = c.Notes.Count(n => n.Status == NoteStatus.Active)
            })
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<CategoryDto?> GetByIdAsync(int id, int userId)
    {
        var c = await _db.Categories.Include(x => x.Notes)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (c is null) return null;

        return new CategoryDto
        {
            Id = c.Id, Name = c.Name, Color = c.Color, Icon = c.Icon,
            IsDefault = c.IsDefault,
            NoteCount = c.Notes.Count(n => n.Status == NoteStatus.Active)
        };
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto, int userId)
    {
        var category = new Category
        {
            Name = dto.Name,
            Color = dto.Color,
            Icon = dto.Icon,
            UserId = userId
        };
        _db.Categories.Add(category);
        await _db.SaveChangesAsync();

        return new CategoryDto { Id = category.Id, Name = category.Name, Color = category.Color, Icon = category.Icon };
    }

    public async Task<CategoryDto?> UpdateAsync(int id, CreateCategoryDto dto, int userId)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (category is null) return null;

        category.Name = dto.Name;
        category.Color = dto.Color;
        category.Icon = dto.Icon;
        await _db.SaveChangesAsync();

        return new CategoryDto { Id = category.Id, Name = category.Name, Color = category.Color, Icon = category.Icon };
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId && !c.IsDefault);
        if (category is null) return false;

        _db.Categories.Remove(category);
        await _db.SaveChangesAsync();
        return true;
    }
}
