namespace BE_Tutor.DTO
{
    public class ApplicationDetailDto
    {
        public string ApplicationId { get; set; } = null!;
        public string TutorId { get; set; } = null!;
        public string Name { get; set; } = null!;
        public double Rating { get; set; }
        public int TotalReviews { get; set; }
        public string Experience { get; set; } = null!;
        public string Specialization { get; set; } = null!;
        public string Qualification { get; set; } = null!;
        public string TeachingArea { get; set; } = null!;
        public string Status { get; set; } = null!;
        public DateTime? AppliedAt { get; set; }
        public string Message { get; set; } = null!;
        public string Phone { get; set; } = null!;
    }
}
