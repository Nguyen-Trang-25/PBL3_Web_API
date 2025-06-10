using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BE_Tutor.Models;
using BE_Tutor.DTO;

namespace BE_Tutor.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ReviewController> _logger;

        public ReviewController(ApplicationDbContext context, ILogger<ReviewController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/review/tutor/{tutorId}
        // Lấy tất cả đánh giá của một gia sư
        [HttpGet("tutor/{tutorId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviewsByTutorId(string tutorId)
        {
            try
            {
            var result = await _context.Tutors
                .Where(t => t.TutorId == tutorId)
                .Select(t => new
                {
                    TutorId = t.TutorId,
                    UserId = t.UserId,
                    Name = t.User != null ? t.User.Name : null,
                    Email = t.User != null ? t.User.Email : null,
                    Phone = t.User != null ? t.User.Phone : null,
                    Gender = t.User != null ? 
                        (t.User.Gender == true ? "Nam" : (t.User.Gender == false ? "Nữ" : null)) : null,
                    Address = t.User != null ? t.User.Address : null,
                    DateOfBirth = t.User != null ? t.User.DateOfBirth : null,
                    Experience = t.Experience,
                    Education = t.Education,
                    SpecialtySubjectId = t.SpecialtySubjectId,
                    SpecialtySubjectName = t.SpecialtySubject != null ? t.SpecialtySubject : null,
                    Rating = t.Reviews.Any() ? Math.Round(t.Reviews.Average(r => r.Rating ?? 0), 1) : 0,
                    TotalReviews = t.Reviews.Count(),
                    IsActive = t.IsActive,
                    CreatedAt = t.User != null ? t.User.CreatedAt : null
                })
                .FirstOrDefaultAsync();

if (result == null)
{
    return NotFound(new { message = "Không tìm thấy gia sư" });
}

return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tutor {TutorId}", tutorId);
                return StatusCode(500, new { message = "Lỗi khi tải thông tin gia sư" });
            }
        }

        // GET: api/review/tutor/{tutorId}/summary
        // Lấy thống kê đánh giá của gia sư
        [HttpGet("tutor/{tutorId}/summary")]
        public async Task<ActionResult<ReviewSummaryDto>> GetReviewSummary(string tutorId)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Where(r => r.TutorId == tutorId)
                    .ToListAsync();

                if (!reviews.Any())
                {
                    return Ok(new ReviewSummaryDto
                    {
                        TutorId = tutorId,
                        TotalReviews = 0,
                        AverageRating = 0,
                        RatingDistribution = new Dictionary<int, int>
                        {
                            { 1, 0 }, { 2, 0 }, { 3, 0 }, { 4, 0 }, { 5, 0 }
                        }
                    });
                }

                // Xử lý cho cả nullable và non-nullable Rating
                var ratingValues = reviews
                    .Select(r => r.Rating)
                    .Where(rating => rating.HasValue && rating.Value >= 1 && rating.Value <= 5)
                    .Select(rating => rating.Value)
                    .ToList();

                var averageRating = ratingValues.Any() ? ratingValues.Average() : 0.0;

                var summary = new ReviewSummaryDto
                {
                    TutorId = tutorId,
                    TotalReviews = reviews.Count,
                    AverageRating = Math.Round(averageRating, 1),
                    RatingDistribution = ratingValues
                        .GroupBy(rating => rating)
                        .ToDictionary(g => g.Key, g => g.Count())
                };

                // Đảm bảo có đủ 5 mức đánh giá
                for (int i = 1; i <= 5; i++)
                {
                    if (!summary.RatingDistribution.ContainsKey(i))
                    {
                        summary.RatingDistribution[i] = 0;
                    }
                }

                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review summary for tutor {TutorId}", tutorId);
                return StatusCode(500, new { message = "Lỗi khi tải thống kê đánh giá" });
            }
        }

        // POST: api/review
        // Tạo đánh giá mới
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> CreateReview([FromBody] CreateReviewDto createReviewDto)
        {
            try
            {
                // Lấy userId từ token
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Không thể xác thực người dùng" });
                }

                // Kiểm tra xem gia sư có tồn tại không
                var tutorExists = await _context.Tutors
                    .AnyAsync(t => t.TutorId == createReviewDto.TutorId);

                if (!tutorExists)
                {
                    return NotFound(new { message = "Không tìm thấy gia sư" });
                }

                // Kiểm tra xem user đã đánh giá gia sư này chưa
                var existingReview = await _context.Reviews
                    .FirstOrDefaultAsync(r => r.TutorId == createReviewDto.TutorId && r.StudentId == userId);

                if (existingReview != null)
                {
                    return BadRequest(new { message = "Bạn đã đánh giá gia sư này rồi" });
                }

                // Validate rating
                if (createReviewDto.Rating < 1 || createReviewDto.Rating > 5)
                {
                    return BadRequest(new { message = "Đánh giá phải từ 1 đến 5 sao" });
                }

                // Tạo review ID mới (10 ký tự)
                string newReviewId = await GenerateNewReviewId();

                // Tạo review mới
                var review = new Review
                {
                    ReviewId = newReviewId,
                    TutorId = createReviewDto.TutorId,
                    StudentId = userId,
                    Rating = createReviewDto.Rating,
                    Comment = createReviewDto.Comment?.Trim(),
                    CreatedAt = DateTime.Now // Sử dụng local time
                };

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                // Lấy thông tin student để trả về
                var student = await _context.Students.FindAsync(userId);

                var reviewDto = new ReviewDto
                {
                    ReviewId = review.ReviewId,
                    TutorId = review.TutorId,
                    StudentId = review.StudentId,
                    StudentName = student?.User.Name ?? "Học viên",
                    Rating = review.Rating,
                    Comment = review.Comment,
                    CreatedAt = review.CreatedAt
                };

                return CreatedAtAction(nameof(GetReviewById), new { id = review.ReviewId }, reviewDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review for tutor {TutorId}", createReviewDto.TutorId);
                return StatusCode(500, new { message = "Lỗi khi tạo đánh giá" });
            }
        }

        // GET: api/review/{id}
        // Lấy chi tiết một đánh giá
        [HttpGet("{id}")]
        public async Task<ActionResult<ReviewDto>> GetReviewById(string id)
        {
            try
            {
                var review = await _context.Reviews
                    .Include(r => r.Student)
                    .FirstOrDefaultAsync(r => r.ReviewId == id);

                if (review == null)
                {
                    return NotFound(new { message = "Không tìm thấy đánh giá" });
                }

                var reviewDto = new ReviewDto
                {
                    ReviewId = review.ReviewId,
                    TutorId = review.TutorId,
                    StudentId = review.StudentId,
                    StudentName = review.Student?.User.Name ?? "Học viên",
                    Rating = review.Rating,
                    Comment = review.Comment,
                    CreatedAt = review.CreatedAt
                };

                return Ok(reviewDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting review {ReviewId}", id);
                return StatusCode(500, new { message = "Lỗi khi tải đánh giá" });
            }
        }

        // PUT: api/review/{id}
        // Cập nhật đánh giá (chỉ người tạo mới được sửa)
        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> UpdateReview(string id, [FromBody] UpdateReviewDto updateReviewDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Không thể xác thực người dùng" });
                }

                var review = await _context.Reviews
                    .Include(r => r.Student)
                    .FirstOrDefaultAsync(r => r.ReviewId == id);

                if (review == null)
                {
                    return NotFound(new { message = "Không tìm thấy đánh giá" });
                }

                // Kiểm tra quyền sửa (chỉ người tạo mới được sửa)
                if (review.StudentId != userId)
                {
                    return Forbid("Bạn chỉ có thể sửa đánh giá của chính mình");
                }

                // Validate rating
                if (updateReviewDto.Rating < 1 || updateReviewDto.Rating > 5)
                {
                    return BadRequest(new { message = "Đánh giá phải từ 1 đến 5 sao" });
                }

                // Cập nhật thông tin
                review.Rating = updateReviewDto.Rating;
                review.Comment = updateReviewDto.Comment?.Trim();

                await _context.SaveChangesAsync();

                var reviewDto = new ReviewDto
                {
                    ReviewId = review.ReviewId,
                    TutorId = review.TutorId,
                    StudentId = review.StudentId,
                    StudentName = review.Student?.User.Name ?? "Học viên",
                    Rating = review.Rating,
                    Comment = review.Comment,
                    CreatedAt = review.CreatedAt
                };

                return Ok(reviewDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating review {ReviewId}", id);
                return StatusCode(500, new { message = "Lỗi khi cập nhật đánh giá" });
            }
        }

        // DELETE: api/review/{id}
        // Xóa đánh giá (chỉ người tạo hoặc admin)
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteReview(string id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Không thể xác thực người dùng" });
                }

                var review = await _context.Reviews.FirstOrDefaultAsync(r => r.ReviewId == id);
                if (review == null)
                {
                    return NotFound(new { message = "Không tìm thấy đánh giá" });
                }

                // Kiểm tra quyền xóa (chỉ người tạo hoặc admin)
                if (review.StudentId != userId && userRole != "Admin")
                {
                    return Forbid("Bạn không có quyền xóa đánh giá này");
                }

                _context.Reviews.Remove(review);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting review {ReviewId}", id);
                return StatusCode(500, new { message = "Lỗi khi xóa đánh giá" });
            }
        }

        // GET: api/review/student/{studentId}
        // Lấy tất cả đánh giá của một học viên
        [HttpGet("student/{studentId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviewsByStudentId(string studentId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                // Chỉ chính chủ hoặc admin mới xem được
                if (userId != studentId && userRole != "Admin")
                {
                    return Forbid("Bạn không có quyền xem đánh giá này");
                }

                var reviews = await _context.Reviews
                    .Where(r => r.StudentId == studentId)
                    .Include(r => r.Tutor)
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new ReviewDto
                    {
                        ReviewId = r.ReviewId,
                        TutorId = r.TutorId,
                        TutorName = r.Tutor != null ? r.Tutor.User.Name : "Gia sư",
                        StudentId = r.StudentId,
                        Rating = r.Rating,
                        Comment = r.Comment,
                        CreatedAt = r.CreatedAt
                    })
                    .ToListAsync();

                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reviews for student {StudentId}", studentId);
                return StatusCode(500, new { message = "Lỗi khi tải đánh giá" });
            }
        }

        // Helper method để tạo Review ID mới
        private async Task<string> GenerateNewReviewId()
        {
            string newId;
            bool exists;

            do
            {
                // Tạo ID theo format: RV + 8 số (tổng 10 ký tự)
                var timestamp = DateTime.Now.ToString("yyyyMMdd");
                var random = new Random().Next(10, 99);
                newId = $"RV{timestamp.Substring(2)}{random}"; // RVyyMMddrr

                // Kiểm tra xem ID đã tồn tại chưa
                exists = await _context.Reviews.AnyAsync(r => r.ReviewId == newId);
            }
            while (exists);

            return newId;
        }
    }

}