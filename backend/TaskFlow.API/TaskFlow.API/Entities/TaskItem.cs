namespace TaskFlow.API.Entities
{
    public class TaskItem
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string Status { get; set; } = "Todo";
        public Guid ProjectId { get; set; }
        public Project Project { get; set; } = null!;
    }
}
