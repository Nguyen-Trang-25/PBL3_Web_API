namespace BE_Tutor.DTO
{
    public class TutorResponse
    {
        public string TutorId { get; set; }
        public string Name { get; set; }
        public string? Specialty { get; set; }
        public double? Rating { get; set; }
        public int? TotalReviews { get; set; }
        public string Experience { get; set; }
    }
}
