using System.Security.Claims;
using BE_Tutor.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE_Tutor.DTO;
using MailKit.Net.Smtp;
using MimeKit;
using MailKit.Security;

namespace BE_Tutor.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RequestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;


        public RequestController(ApplicationDbContext context)
        {
            _context = context;
        }
        // Xử lý form tạo yêu cầu tìm gia sư và trả về JSON
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] Request model)
        {
            if (model == null)
            {
                return BadRequest("Model không hợp lệ");
            }

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                                        .SelectMany(v => v.Errors)
                                        .Select(e => e.ErrorMessage)
                                        .ToList();
                return BadRequest(new { message = "Dữ liệu model không hợp lệ.", errors });
            }

            var latestApp = await _context.Requests
                .OrderByDescending(a => a.RequestId)
                .FirstOrDefaultAsync();

            string newId = "0000000001"; // ID mặc định nếu chưa có bản ghi nào
            if (latestApp != null)
            {
                long latestNumber = long.Parse(latestApp.RequestId);
                newId = (latestNumber + 1).ToString("D10"); // format về 10 chữ số
            }

            try
            {
                if (ModelState.IsValid)
                {
                    // Kiểm tra dữ liệu trước khi tạo đối tượng
                    if (string.IsNullOrEmpty(newId))
                        return BadRequest("RequestId không được để trống.");

                    if (await _context.Requests.AnyAsync(r => r.RequestId == newId))
                        return BadRequest("RequestId đã tồn tại.");

                    if (model.Fee.HasValue && model.Fee < 0)
                        return BadRequest("Fee phải là số dương hoặc null.");

                    if (string.IsNullOrWhiteSpace(model.LearningFormat) || model.LearningFormat.Length > 10)
                        return BadRequest("LearningFormat không hợp lệ.");

                    if (string.IsNullOrWhiteSpace(model.SubjectId) || model.SubjectId.Length > 3)
                        return BadRequest("SubjectId không hợp lệ.");


                    var request = new Request
                    {
                        RequestId = newId,
                        StudentId = model.StudentId,  // Cần lấy từ session hoặc login thực tế
                        SubjectId = model.SubjectId,
                        Level = model.Level,
                        Fee = model.Fee,
                        Schedule = model.Schedule,
                        Location = model.Location,
                        GenderTutor = model.GenderTutor,
                        Requirement = model.Requirement,
                        LearningFormat = model.LearningFormat,
                        CreatedAt = DateTime.Now,
                        Status = "pending",
                    };



                    _context.Requests.Add(request);
                    await _context.SaveChangesAsync();

                    var result = new
                    {
                        success = true,
                        message = "Yêu cầu đã được đăng thành công.",
                        requestId = request.RequestId,
                        subject = request.SubjectId,
                        level = request.Level,
                        fee = request.Fee,
                        schedule = request.Schedule,
                        location = request.Location,
                        genderTutor = request.GenderTutor,
                        requirement = request.Requirement,
                        learningFormat = request.LearningFormat,
                        createdAt = request.CreatedAt,
                    };

                    return Ok(result);
                }
                else
                {
                    return BadRequest("Dữ liệu không hợp lệ.");
                }
            }
            catch (DbUpdateException dbEx)
            {
                var innerExceptionMessage = dbEx.InnerException?.Message ?? "No inner exception";
                Console.WriteLine($"DbUpdateException: {dbEx.Message}");
                Console.WriteLine($"Inner Exception: {innerExceptionMessage}");

                return StatusCode(500, new
                {
                    message = "Lỗi khi lưu dữ liệu vào DB.",
                    detail = innerExceptionMessage
                });
            }
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search(
     string? subjectName,
     string? location,
     string? level,
     string? learningFormat,
     bool? genderTutor)
        {
            var query = _context.Requests
                .Include(r => r.Subject)
                .Where(r => r.Status == "pending") // Chỉ lấy các lớp đang chờ duyệt
                .AsQueryable();

            if (!string.IsNullOrEmpty(subjectName))
            {
                var lowerName = subjectName.ToLower();
                query = query.Where(r => r.Subject != null && r.Subject.Name.ToLower().Contains(lowerName));
            }

            if (!string.IsNullOrEmpty(location))
            {
                query = query.Where(r => r.Location.ToLower().Contains(location.ToLower()));
            }

            if (!string.IsNullOrEmpty(level))
            {
                query = query.Where(r => r.Level == level);
            }

            if (!string.IsNullOrEmpty(learningFormat))
            {
                query = query.Where(r => r.LearningFormat == learningFormat);
            }

            if (genderTutor.HasValue)
            {
                query = query.Where(r => r.GenderTutor == genderTutor.Value);
            }

            var result = await query
                .Select(r => new
                {
                    r.RequestId,
                    r.Fee,
                    r.Level,
                    r.Location,
                    r.LearningFormat,
                    r.GenderTutor,
                    r.Schedule,
                    r.Status,
                    r.CreatedAt,
                    r.Requirement,
                    Subject = r.Subject != null ? r.Subject.Name : null
                })
                .ToListAsync();

            return Ok(result);
        }

        [Authorize]
        [HttpGet("historyRequest")]
        public async Task<IActionResult> GetHistory()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
                return Unauthorized(new { message = "Không thể xác thực người dùng" });

            if (role == "student")
            {
                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
                if (student == null)
                    return NotFound(new { message = "Không tìm thấy học sinh" });

                var studentHistory = await _context.Requests
                    .Include(r => r.Subject)
                    .Include(r => r.Student)
                    .Include(r => r.Applications).ThenInclude(a => a.Tutor)
                    .Include(r => r.Contracts)
                    .Where(r => r.StudentId == student.StudentId)
                    .Select(r => new RequestHistoryDto
                    {
                        RequestId = r.RequestId,
                        Subject = r.SubjectId,
                        SubjectName = r.Subject != null ? r.Subject.Name : null,
                        Level = r.Level,
                        Fee = r.Fee,
                        Schedule = r.Schedule,
                        Location = r.Location,
                        Status = r.Status,
                        CreatedAt = r.CreatedAt,
                        ApplicationsCount = r.Applications.Count,
                        SelectedTutor = r.Applications.FirstOrDefault(a => a.Status == "accepted") != null
                            ? r.Applications.FirstOrDefault(a => a.Status == "accepted").Tutor.User.Name
                            : null,
                        StartDate = r.Contracts.FirstOrDefault() != null
                            ? r.Contracts.FirstOrDefault().StartDate.ToDateTime(TimeOnly.MinValue)
                            : (DateTime?)null,
                        HasReviewed = _context.Reviews.Any(rev =>
                            rev.StudentId == student.StudentId &&
                            rev.TutorId == r.Applications.FirstOrDefault(a => a.Status == "accepted").TutorId
                        ),
                        StudentName = r.Student != null ? r.Student.User.Name : null
                    })
                    .ToListAsync();

                return Ok(studentHistory);
            }

            else if (role == "tutor")
            {
                var tutor = await _context.Tutors.FirstOrDefaultAsync(t => t.UserId == userId);
                if (tutor == null)
                    return NotFound(new { message = "Không tìm thấy gia sư" });

                var appliedRequestIds = await _context.Applications
                    .Where(a => a.TutorId == tutor.TutorId)
                    .Select(a => a.RequestId)
                    .Distinct()
                    .ToListAsync();

                var tutorHistory = await _context.Requests
                    .Include(r => r.Subject)
                    .Include(r => r.Student)
                    .Include(r => r.Applications).ThenInclude(a => a.Tutor)
                    .Include(r => r.Contracts)
                    .Where(r => appliedRequestIds.Contains(r.RequestId))
                    .Select(r => new RequestHistoryDto
                    {
                        RequestId = r.RequestId,
                        Subject = r.SubjectId,
                        SubjectName = r.Subject != null ? r.Subject.Name : null,
                        Level = r.Level,
                        Fee = r.Fee,
                        Schedule = r.Schedule,
                        Location = r.Location,
                        Status = r.Status,
                        CreatedAt = r.CreatedAt,
                        ApplicationsCount = r.Applications.Count,
                        SelectedTutor = r.Applications.FirstOrDefault(a => a.Status == "accepted") != null
                            ? r.Applications.FirstOrDefault(a => a.Status == "accepted").Tutor.User.Name
                            : null,
                        StartDate = r.Contracts.FirstOrDefault() != null
                            ? r.Contracts.FirstOrDefault().StartDate.ToDateTime(TimeOnly.MinValue)
                            : (DateTime?)null,
                        HasReviewed = _context.Reviews.Any(rev =>
                            rev.StudentId == r.StudentId &&
                            rev.TutorId == tutor.TutorId
                        ),
                        StudentName = r.Student != null ? r.Student.User.Name : null
                    })
                    .ToListAsync();

                return Ok(tutorHistory);
            }

            return BadRequest(new { message = "Role không hợp lệ" });
        }




        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var request = await _context.Requests
                .Include(r => r.Subject)
                .FirstOrDefaultAsync(r => r.RequestId == id);

            if (request == null)
                return NotFound(new { message = "Không tìm thấy yêu cầu" });

            return Ok(new
            {
                request.RequestId,
                request.StudentId,
                SubjectName = request.Subject?.Name,
                request.Level,
                request.Fee,
                request.Schedule,
                request.Status,
                request.CreatedAt,
                request.Location,
                request.GenderTutor,
                request.Requirement,
                request.LearningFormat
            });
        }

        //Cập nhật yêu cầu(chỉ student sở hữu yêu cầu)
        [Authorize(Roles = "student")]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateRequest(string id, [FromBody] Request model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null) return Unauthorized();

            var existing = await _context.Requests.FirstOrDefaultAsync(r => r.RequestId == id && r.StudentId == student.StudentId);
            if (existing == null)
                return NotFound(new { message = "Không tìm thấy yêu cầu của bạn" });

            // Cho phép cập nhật các trường
            existing.Fee = model.Fee;
            existing.Schedule = model.Schedule;
            existing.Level = model.Level;
            existing.Location = model.Location;
            existing.Requirement = model.Requirement;
            existing.LearningFormat = model.LearningFormat;
            existing.GenderTutor = model.GenderTutor;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thành công" });
        }

        //Xóa yêu cầu (chỉ student sở hữu yêu cầu)
        [Authorize(Roles = "student")]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteRequest(string id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null) return Unauthorized();

            var request = await _context.Requests
                .FirstOrDefaultAsync(r => r.RequestId == id && r.StudentId == student.StudentId);

            if (request == null)
                return NotFound(new { message = "Không tìm thấy yêu cầu của bạn" });

            _context.Requests.Remove(request);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xoá yêu cầu thành công" });
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
                SenderId = "system", // ID của hệ thống
                ReceiverId = receiverId,
                Content = content,
                SentAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
        }


        [HttpPost("Contact")]
        public async Task<IActionResult> PostContact([FromBody] ContactRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) ||
               string.IsNullOrWhiteSpace(request.Email) ||
               string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new { message = "Vui lòng nhập đầy đủ thông tin." });
            }

            try
            {
                var mail = new MimeMessage();

                mail.From.Add(new MailboxAddress("Finder Web", "anhngocnguyen112005@gmail.com"));
                mail.To.Add(new MailboxAddress("Admin", "anh422912@gmail.com"));


                mail.Subject = $"[Liên hệ] từ {request.Name}";
                mail.Body = new TextPart("plain")
                {
                    Text = $"Tên: {request.Name}\nEmail: {request.Email}\n\n Nội dung:\n{request.Message}"
                };

                using var smtp = new SmtpClient();//using auto giải phóng tài nguyên khi dùng xong

                await smtp.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);// connet máy chủ gửi mail của Gmail

                await smtp.AuthenticateAsync("anhngocnguyen112005@gmail.com", "cbym pyuf pvtg teqi"); // không có dấu cách

                await smtp.SendAsync(mail);// gửi mail

                await smtp.DisconnectAsync(true);// ngắt kết nối smtp

                return Ok(new { message = "Gửi liên hệ thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Gửi mail thất bại: {ex.Message}" });
            }
        }

        [Authorize]
        [HttpPut("update-status/{id}")]
        public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateStatusDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
                return Unauthorized(new { message = "Không xác thực được người dùng." });

            var request = await _context.Requests.Include(r => r.Subject).FirstOrDefaultAsync(r => r.RequestId == id);
            if (request == null)
                return NotFound(new { message = "Không tìm thấy yêu cầu." });

            // Chỉ cho phép student cập nhật yêu cầu của mình
            if (role == "student")
            {
                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
                if (student == null || request.StudentId != student.StudentId)
                    return Forbid("Bạn không có quyền cập nhật yêu cầu này.");
            }

            // Nếu chuyển sang active thì tạo contract
            if (dto.Status == "active")
            {
                // Kiểm tra xem đã có contract chưa
                bool hasContract = await _context.Contracts.AnyAsync(c => c.RequestId == request.RequestId);
                if (hasContract)
                    return BadRequest(new { message = "Yêu cầu này đã có hợp đồng." });

                var latestContract = await _context.Contracts
                    .OrderByDescending(c => c.ContractId)
                    .FirstOrDefaultAsync();

                string newContractId = "0000000001";
                if (latestContract != null)
                {
                    long latestNumber = long.Parse(latestContract.ContractId);
                    newContractId = (latestNumber + 1).ToString("D10");
                }

                var contract = new Contract
                {
                    ContractId = newContractId,
                    RequestId = request.RequestId,
                    Fee = request.Fee ?? 0,
                    Location = request.Location ?? "",
                    Schedule = request.Schedule ?? "",
                    StartDate = DateOnly.FromDateTime(DateTime.Today),
                    EndDate = DateOnly.FromDateTime(DateTime.Today.AddMonths(1)), // Giả sử hợp đồng 1 tháng
                    Status = "active",
                    CreatedAt = DateTime.Now
                };

                _context.Contracts.Add(contract);
            }

            request.Status = dto.Status;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái thành công." });
        }

    }
}
