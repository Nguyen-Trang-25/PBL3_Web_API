namespace BE_Tutor.DTO
{
    public class ReviewSummaryDto
    {
        public string TutorId { get; set; } = string.Empty;
        public int TotalReviews { get; set; }
        public double? AverageRating { get; set; }
        public Dictionary<int, int> RatingDistribution { get; set; } = new();
    }
}
