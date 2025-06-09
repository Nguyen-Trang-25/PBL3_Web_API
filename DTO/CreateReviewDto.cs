
namespace BE_Tutor.DTO
{
    public class CreateReviewDto
    {
        public string TutorId { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }

}
