using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.DTOs.Projects
{
    public class CreateProjectDto
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }
    }
}
