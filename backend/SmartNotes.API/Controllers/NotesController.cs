using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartNotes.API.DTOs.Notes;
using SmartNotes.API.Interfaces;

namespace SmartNotes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotesController : ControllerBase
{
    private readonly INoteService _notes;
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    public NotesController(INoteService notes) => _notes = notes;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int? categoryId,
        [FromQuery] string? status)
    {
        var notes = await _notes.GetAllAsync(UserId, search, categoryId, status);
        return Ok(notes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var note = await _notes.GetByIdAsync(id, UserId);
        return note is null ? NotFound() : Ok(note);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateNoteDto dto)
    {
        var note = await _notes.CreateAsync(dto, UserId);
        return CreatedAtAction(nameof(GetById), new { id = note.Id }, note);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateNoteDto dto)
    {
        var note = await _notes.UpdateAsync(id, dto, UserId);
        return note is null ? NotFound() : Ok(note);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _notes.DeleteAsync(id, UserId);
        return result ? NoContent() : NotFound();
    }

    [HttpPost("{id}/archive")]
    public async Task<IActionResult> Archive(int id)
    {
        var result = await _notes.ArchiveAsync(id, UserId);
        return result ? Ok(new { message = "Note archive status toggled." }) : NotFound();
    }

    [HttpGet("{id}/versions")]
    public async Task<IActionResult> GetVersions(int id)
    {
        var versions = await _notes.GetVersionsAsync(id, UserId);
        return Ok(versions);
    }
}
