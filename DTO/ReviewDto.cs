namespace BE_Tutor.DTO
{
    public class ReviewDto
    {
        public string ReviewId { get; set; } = string.Empty;
        public string TutorId { get; set; } = string.Empty;
        public string? TutorName { get; set; }
        public string StudentId { get; set; } = string.Empty;
        public string? StudentName { get; set; }
        public int? Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
