using BE_Tutor.Models;
using BE_Tutor.DTO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BE_Tutor.Controllers
{
    [ApiController] 
    [Route("api/[controller]")] 

    public class ApplicationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ApplicationController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("apply")]
        public async Task<IActionResult> Apply([FromBody] ApplicationViewModel model)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                return BadRequest(new { message = "Dữ liệu model không hợp lệ.", errors });
            }

            // Lấy ID mới
            var latestApp = await _context.Applications
                .OrderByDescending(a => a.ApplicationId)
                .FirstOrDefaultAsync();

            string newId = "0000000001"; // ID mặc định nếu chưa có bản ghi nào
            if (latestApp != null)
            {
                long latestNumber = long.Parse(latestApp.ApplicationId);
                newId = (latestNumber + 1).ToString("D10"); // format về 10 chữ số
            }


            var application = new Application
            {
                ApplicationId = newId,
                TutorId = model.TutorId,
                RequestId = model.RequestId,
                FullName = model.FullName,
                Email = model.Email,
                Phone = model.Phone,
                Specialization = model.Specialization,
                Qualification = model.Qualification,
                Experience = model.Experience,
                TeachingArea = model.TeachingArea,
                TeachingFormat = model.TeachingFormat,
                Gender = model.Gender
            };

            var tutor = await _context.Tutors
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TutorId == model.TutorId);

            if (tutor == null)
            {
                return NotFound(new { message = "Không tìm thấy gia sư tương ứng." });
            }

            var request = await _context.Requests
                .Include(r => r.Student)
                    .ThenInclude(s => s.User)
                .Include(r => r.Subject)  // Thêm phần này để lấy tên môn học
                .FirstOrDefaultAsync(r => r.RequestId == model.RequestId);
            if (request != null)
            {
                request.Status = "applied";
                await SendSystemMessage(model.TutorId, $"Tutor {tutor.User.Name} APPLIED \"{request.Subject.Name}\" {request.Level}.");
            }
            else
            {
                return NotFound(new { message = "Không tìm thấy Request tương ứng." });
            }



            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            // Optional: chuyển sang trang thông báo hoặc xác nhận
            return Ok(new { success = true, message = "Ứng tuyển thành công!" });
        }

        [HttpGet("by-request/{requestId}")]
        public async Task<IActionResult> GetApplicationsByRequestId(string requestId)
        {
            var applications = await _context.Applications
                .Include(a => a.Tutor).ThenInclude(t => t.User)
                .Where(a => a.RequestId == requestId)
                .Select(a => new ApplicationDetailDto
                {
                    ApplicationId = a.ApplicationId,
                    TutorId = a.TutorId,
                    Name = a.Tutor.User.Name,
                    Rating = _context.Reviews
                                .Where(r => r.TutorId == a.TutorId && r.Rating != null)
                                .Average(r => (double?)r.Rating) ?? 0,
                    TotalReviews = _context.Reviews.Count(r => r.TutorId == a.TutorId),
                    Experience = a.Experience,
                    Specialization = a.Specialization,
                    Qualification = a.Qualification,
                    TeachingArea = a.TeachingArea,
                    Status = a.Status ?? "pending",
                    AppliedAt = a.AppliedAt,
                    Message = a.Experience, // giả định Experience là "message" trong dữ liệu mock của bạn
                    Phone = a.Phone
                })
                .ToListAsync();

            return Ok(applications);
        }


        private async Task SendSystemMessage(string receiverId, string content)
        {
            var latestMessage = await _context.Messages
                .OrderByDescending(m => m.MessageId)
                .FirstOrDefaultAsync();

            string newId = "0000000001";
            if (latestMessage != null)
            {
                long latestNumber = long.Parse(latestMessage.MessageId);
                newId = (latestNumber + 1).ToString("D10");
            }

            var message = new Message
            {
                MessageId = newId,
                SenderId = "0000000004", // ID của hệ thống
                ReceiverId = receiverId,
                Content = content,
                SentAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
        }

    }

}
