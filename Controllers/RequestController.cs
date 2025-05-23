﻿using BE_Tutor.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
                        Status = "Pending",
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
            var query = _context.Requests.Include(r => r.Subject).AsQueryable();

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

        [HttpGet("historyRequest/{studentId}")]
        public async Task<IActionResult> GetClassHistoryByStudentId(string studentId)
        {
            var requests = await _context.Requests
                .Where(r => r.StudentId == studentId)
                .Select(r => new {
                    subject = r.Subject,
                    location = r.Location,
                    fee = r.Fee,
                    status = r.Status
                })
                .ToListAsync();

            return Ok(requests);
        }

    }
}
