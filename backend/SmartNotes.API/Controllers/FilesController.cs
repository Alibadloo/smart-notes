using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartNotes.API.Services;

namespace SmartNotes.API.Controllers;

[ApiController]
[Route("api/notes/{noteId}/attachments")]
[Authorize]
public class FilesController : ControllerBase
{
    private readonly FileService _fileService;
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    public FilesController(FileService fileService) => _fileService = fileService;

    [HttpPost]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<IActionResult> Upload(int noteId, IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        var att = await _fileService.UploadAsync(noteId, UserId, file);
        return att is null ? NotFound() : Ok(att);
    }

    [HttpGet("{attachmentId}/download")]
    public async Task<IActionResult> Download(int noteId, int attachmentId)
    {
        var result = await _fileService.DownloadAsync(attachmentId, UserId);
        if (result is null) return NotFound();

        var (path, contentType, fileName) = result.Value;
        return PhysicalFile(path, contentType, fileName);
    }

    [HttpDelete("{attachmentId}")]
    public async Task<IActionResult> Delete(int noteId, int attachmentId)
    {
        var result = await _fileService.DeleteAsync(attachmentId, UserId);
        return result ? NoContent() : NotFound();
    }
}
