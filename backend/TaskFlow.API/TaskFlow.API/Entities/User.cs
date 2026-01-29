namespace TaskFlow.API.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public ICollection<Project> Projects { get; set; } = new List<Project>();
    }
}
