public class RequestHistoryDto
{
    public string StudentId { get; set; }
    public string RequestId { get; set; }
    public string Subject { get; set; }
    public string SubjectName { get; set; }
    public string Level { get; set; }
    public decimal? Fee { get; set; }
    public string Schedule { get; set; }
    public string Location { get; set; }
    public string Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ApplicationsCount { get; set; }
    public string SelectedTutor { get; set; }
    public DateTime? StartDate { get; set; }
    public bool HasReviewed { get; set; }
    public string StudentName { get; set; }
}
