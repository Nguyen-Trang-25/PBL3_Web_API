using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BE_Tutor.Models;

namespace BE_Tutor.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContractController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ContractController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. Tạo hợp đồng từ học sinh hoặc gia sư
        [Authorize(Roles = "student,tutor")]
        [HttpPost("create")]
        public async Task<IActionResult> CreateContract([FromBody] Contract model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (model == null || string.IsNullOrEmpty(model.RequestId))
                return BadRequest("Dữ liệu không hợp lệ.");

            var request = await _context.Requests.FirstOrDefaultAsync(r => r.RequestId == model.RequestId);
            if (request == null) return NotFound("Không tìm thấy yêu cầu.");

            // Gửi tin nhắn đến học sinh hoặc gia sư
            if (role == "student")
            {
                var tutorId = await _context.Applications
                    .Where(a => a.RequestId == model.RequestId)
                    .Select(a => a.TutorId)
                    .FirstOrDefaultAsync();

                var tutorUserId = await _context.Tutors
                    .Where(t => t.TutorId == tutorId)
                    .Select(t => t.UserId)
                    .FirstOrDefaultAsync();

                await SendSystemMessage(tutorUserId, $"Học sinh đã tạo hợp đồng cho lớp học bạn đã ứng tuyển.");
            }
            else if (role == "tutor")
            {
                var studentUserId = await _context.Students
                    .Where(s => s.StudentId == request.StudentId)
                    .Select(s => s.UserId)
                    .FirstOrDefaultAsync();

                await SendSystemMessage(studentUserId, $"Gia sư đã tạo hợp đồng cho lớp học của bạn.");
            }


            if (await _context.Contracts.AnyAsync(c => c.RequestId == model.RequestId))
                return BadRequest("Request này đã có hợp đồng.");

            var last = await _context.Contracts.OrderByDescending(c => c.ContractId).FirstOrDefaultAsync();
            string newId = last == null ? "0000000001" : (long.Parse(last.ContractId) + 1).ToString("D10");

            var contract = new Contract
            {
                ContractId = newId,
                RequestId = model.RequestId,
                StartDate = model.StartDate,
                EndDate = model.EndDate,
                Fee = model.Fee,
                Schedule = model.Schedule,
                Location = model.Location,
                Status = "pending",
                CreatedAt = DateTime.Now
            };

            _context.Contracts.Add(contract);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tạo hợp đồng thành công", contractId = newId });
        }

        // 2. Học sinh hoặc gia sư xác nhận hợp đồng
        [Authorize(Roles = "student,tutor")]
        [HttpPut("confirm/{contractId}")]
        public async Task<IActionResult> ConfirmContract(string contractId)
        {
            var contract = await _context.Contracts.FirstOrDefaultAsync(c => c.ContractId == contractId);
            if (contract == null) return NotFound("Không tìm thấy hợp đồng.");

            contract.Status = "active";
            var request = await _context.Requests
            .Include(r => r.Student)
            .FirstOrDefaultAsync(r => r.RequestId == contract.RequestId);

            if (request != null)
            {
                var studentUserId = await _context.Students
                    .Where(s => s.StudentId == request.StudentId)
                    .Select(s => s.UserId)
                    .FirstOrDefaultAsync();

                var tutorUserId = await _context.Applications
                    .Where(a => a.RequestId == contract.RequestId)
                    .Select(a => a.Tutor.TutorId)
                    .Distinct()
                    .Join(_context.Tutors, aTutorId => aTutorId, t => t.TutorId, (aTutorId, t) => t.UserId)
                    .FirstOrDefaultAsync();

                var senderName = User.FindFirstValue(ClaimTypes.Role) == "student" ? "Học sinh" : "Gia sư";
                var receiverId = User.FindFirstValue(ClaimTypes.Role) == "student" ? tutorUserId : studentUserId;

                await SendSystemMessage(receiverId, $"{senderName} đã xác nhận hợp đồng. Hợp đồng hiện đã có hiệu lực.");
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Hợp đồng đã được xác nhận và kích hoạt." });
        }

        // 3. Admin lấy tất cả hợp đồng
        [Authorize(Roles = "admin")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllContracts()
        {
            var contracts = await _context.Contracts
                .Include(c => c.Request)
                .ThenInclude(r => r.Subject)
                .Select(c => new
                {
                    c.ContractId,
                    c.RequestId,
                    Subject = c.Request.Subject.Name,
                    c.StartDate,
                    c.EndDate,
                    c.Fee,
                    c.Schedule,
                    c.Location,
                    c.Status,
                    c.CreatedAt
                })
                .ToListAsync();

            return Ok(contracts);
        }

        // 4. Admin cập nhật trạng thái hợp đồng
        [Authorize(Roles = "admin")]
        [HttpPut("admin/status/{contractId}")]
        public async Task<IActionResult> UpdateStatus(string contractId, [FromBody] string status)
        {
            var contract = await _context.Contracts
                .Include(c => c.Request)
                .ThenInclude(r => r.Student)
                .FirstOrDefaultAsync(c => c.ContractId == contractId);

            if (contract == null)
                return NotFound("Không tìm thấy hợp đồng.");

            contract.Status = status;
            await _context.SaveChangesAsync();

            // Lấy userId của học sinh
            var studentUserId = await _context.Students
                .Where(s => s.StudentId == contract.Request.StudentId)
                .Select(s => s.UserId)
                .FirstOrDefaultAsync();

            // Lấy userId của gia sư từ ứng tuyển
            var tutorUserId = await _context.Applications
                .Where(a => a.RequestId == contract.RequestId)
                .Select(a => a.Tutor.UserId)
                .FirstOrDefaultAsync();

            // Soạn nội dung tin nhắn
            string message = $"Admin đã cập nhật trạng thái hợp đồng [{contract.ContractId}] thành: {status}.";

            if (!string.IsNullOrEmpty(studentUserId))
                await SendSystemMessage(studentUserId, message);

            if (!string.IsNullOrEmpty(tutorUserId))
                await SendSystemMessage(tutorUserId, message);

            return Ok(new { message = "Trạng thái đã được cập nhật và thông báo đã được gửi." });
        }


        // 5. Lấy danh sách hợp đồng của học sinh hoặc gia sư
        [Authorize(Roles = "student,tutor")]
        [HttpGet("my-contracts")]
        public async Task<IActionResult> GetMyContracts()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (role == "student")
            {
                var student = await _context.Students.FirstOrDefaultAsync(s => s.UserId == userId);
                if (student == null) return NotFound();

                var result = await _context.Contracts
                    .Include(c => c.Request).ThenInclude(r => r.Subject)
                    .Where(c => c.Request.StudentId == student.StudentId)
                    .ToListAsync();

                return Ok(result);
            }
            else if (role == "tutor")
            {
                var tutor = await _context.Tutors.FirstOrDefaultAsync(t => t.UserId == userId);
                if (tutor == null) return NotFound();

                var result = await _context.Contracts
                    .Include(c => c.Request)
                    .ThenInclude(r => r.Subject)
                    .Where(c => _context.Applications.Any(a => a.TutorId == tutor.TutorId && a.RequestId == c.RequestId))
                    .ToListAsync();

                return Ok(result);
            }

            return Unauthorized();
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

    }
}
