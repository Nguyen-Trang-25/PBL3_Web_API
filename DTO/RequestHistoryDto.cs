namespace BE_Tutor.DTO
{
    public class RequestHistoryDto
    {
        public string RequestId { get; set; }
        public string StudentId { get; set; }
        public string? SubjectName { get; set; }  // Thay thế SubjectId bằng tên môn học
        public string Level { get; set; }
        public decimal? Fee { get; set; }
        public string Schedule { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Location { get; set; }
        public bool GenderTutor { get; set; }
        public string Requirement { get; set; }
        public string LearningFormat { get; set; }
    }
}
