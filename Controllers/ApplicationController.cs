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

            var request = await _context.Requests
                .FirstOrDefaultAsync(r => r.RequestId == model.RequestId);
            if (request != null)
            {
                request.Status = "Applied";
            }
            else
            {
                // Nếu không tìm thấy request, bạn có thể trả về lỗi hoặc xử lý tuỳ ý
                return NotFound(new { message = "Không tìm thấy Request tương ứng." });
            }


            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            // Optional: chuyển sang trang thông báo hoặc xác nhận
            return Ok(new { success = true, message = "Ứng tuyển thành công!" });
        }
    }

}
