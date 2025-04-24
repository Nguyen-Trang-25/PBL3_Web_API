using FindTutor_MVC.Models;
using Microsoft.AspNetCore.Mvc;
using FindTutor_MVC.Models.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace FindTutor_MVC.Controllers
{
    public class ApplicationController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ApplicationController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Apply()
        {
            return View();
        }

        [HttpPost]
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
                TutorId = "0000000001",
                RequestId = "0000000001",
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

            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            // Optional: chuyển sang trang thông báo hoặc xác nhận
            return Json(new { success = true, message = "Ứng tuyển thành công!" });
        }

        public IActionResult Success()
        {
            return View();
        }
    }

}
