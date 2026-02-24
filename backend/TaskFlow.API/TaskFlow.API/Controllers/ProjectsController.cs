using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Xml.Linq;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs.Projects;
using TaskFlow.API.DTOs.Tasks;
using TaskFlow.API.Entities;


namespace TaskFlow.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserProjects()
        {
            var userId = Guid.Parse(User.FindFirst("id")!.Value);

            var projects = await _context.Projects
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.Id)
                .Select(p => new ProjectResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description
                })
                .ToListAsync();

            return Ok(projects);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto dto)
        {
            var userId = Guid.Parse(User.FindFirst("id")!.Value);

            var project = new Project
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                UserId = userId
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return Ok(project);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteProject(Guid id)
        {
            var userId = Guid.Parse(User.FindFirst("id")!.Value);

            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (project == null)
                return NotFound(new { message = "Project not found" });

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateProject(Guid id, [FromBody] UpdateProjectDto dto)
        {
            var userId = Guid.Parse(User.FindFirst("id")!.Value);

            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (project == null)
                return NotFound(new { message = "Project not found" });

            project.Name = dto.Name;
            project.Description = dto.Description;

            await _context.SaveChangesAsync();

            return Ok(new ProjectResponseDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = dto.Description
            });
        }

        [HttpGet("{projectId:guid}/tasks")]
        public async Task<IActionResult> GetTasksByProject(Guid projectId)
        {
            var userId = Guid.Parse(User.FindFirst("id")!.Value);

            var ownsProject = await _context.Projects
                .AnyAsync(p => p.Id == projectId && p.UserId == userId);

            if (!ownsProject)
                return NotFound(new { message = "Project not found" });

            var tasks = await _context.Tasks
                .Where(t => t.ProjectId == projectId)
                .OrderByDescending(t => t.Id)
                .Select(t => new TaskResponseDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    IsCompleted = t.IsCompleted,
                    ProjectId = projectId,
                })
                .ToListAsync();

            return Ok(tasks);
        }

    }
}
