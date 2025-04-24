using FindTutor_MVC.Models;
using Microsoft.AspNetCore.Mvc;

namespace FindTutor_MVC.Controllers
{
    public class RequestController : Controller
    {
        private readonly ApplicationDbContext _context;

        public RequestController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Hiển thị form tạo yêu cầu tìm gia sư
        public IActionResult Create()
        {
            return View();
        }

        // Xử lý form tạo yêu cầu tìm gia sư và trả về JSON
        [HttpPost]
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

            try
            {
                if (ModelState.IsValid)
                {
                    var request = new Request
                    {
                        RequestId = model.RequestId,
                        StudentId = model.StudentId,  // Cần lấy từ session hoặc login thực tế
                        Subjectid = model.Subjectid,
                        Level = model.Level,
                        Fee = model.Fee,
                        Schedule = model.Schedule,
                        Location = model.Location,
                        GenderTutor = model.GenderTutor,
                        Requirement = model.Requirement,
                        LearningFormat = model.LearningFormat,
                        CreatedAt = DateTime.Now,
                        Status = "Pending"
                    };

                    _context.Requests.Add(request);
                    await _context.SaveChangesAsync();

                    var result = new
                    {
                        success = true,
                        message = "Yêu cầu đã được đăng thành công.",
                        requestId = request.RequestId,
                        subject = request.Subjectid,
                        level = request.Level,
                        fee = request.Fee,
                        schedule = request.Schedule,
                        location = request.Location,
                        genderTutor = request.GenderTutor,
                        requirement = request.Requirement,
                        learningFormat = request.LearningFormat,
                        createdAt = request.CreatedAt
                    };

                    return Json(result);
                }
                else
                {
                    return BadRequest("Dữ liệu không hợp lệ.");
                }
            }
            catch (Exception ex)
            {
                // Log exception (thêm vào console hoặc database)
                return StatusCode(500, new { message = "Đã xảy ra lỗi: " + ex.Message });
            }
        }

    }
}
