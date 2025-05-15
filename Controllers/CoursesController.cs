//using BE_Tutor.Models;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;

//namespace BE_Tutor.Controllers
//{
//    public class CoursesController : Controller
//    {
//        private readonly ApplicationDbContext _context;

//        public CoursesController(ApplicationDbContext context)
//        {
//            _context = context;
//        }

//        // Hiển thị form tìm kiếm
//        public IActionResult Search()
//        {
//            return View();
//        }

//        // Xử lý tìm kiếm và hiển thị kết quả
//        [HttpGet]
//        [HttpGet]
//        public async Task<IActionResult> Search(string? subject, decimal? minFee, decimal? maxFee,
//bool? tutorGender, string? level, string grade, string? location, DayOfWeek? day, TimeOnly? starttime, TimeOnly? endtime)
//        {
//            var query = _context.Courses.AsQueryable();

//            // Bao gồm Subject nhưng chỉ lấy các trường cần thiết
//            query = query.Include(c => c.Subject);

//            if (!string.IsNullOrEmpty(subject))
//                query = query.Where(c => c.Subject.Name == subject);

//            if (minFee.HasValue)
//                query = query.Where(c => c.Fee >= minFee.Value);

//            if (maxFee.HasValue)
//                query = query.Where(c => c.Fee <= maxFee.Value);

//            // Bao gồm Tutor nhưng chỉ lấy các trường cần thiết
//            query = query.Include(c => c.Tutor).ThenInclude(t => t.User);

//            if (tutorGender.HasValue)
//                query = query.Where(c => c.Tutor.User.Gender == tutorGender);

//            if (!string.IsNullOrEmpty(location))
//                query = query.Where(c => c.Location.Contains(location));

//            if (!string.IsNullOrEmpty(level))
//                query = query.Where(c => c.Level == level);

//            // Bao gồm Schedules nhưng tránh vòng lặp
//            query = query.Include(c => c.Schedules);

//            if (day.HasValue)
//                query = query.Where(c => c.Schedules.Any(s => (DayOfWeek)s.Date == day));

//            if (starttime.HasValue && endtime.HasValue)
//                query = query.Where(c => c.Schedules.Any(s => s.StartTime >= starttime && s.EndTime <= endtime));

//            // Lấy kết quả và chỉ chọn các trường cần thiết để tránh vòng lặp
//            var result = await query
//                .Select(c => new
//                {
//                    c.CourseId,
//                    c.Fee,
//                    c.Level,
//                    c.Location,
//                    Subject = c.Subject.Name,
//                    Tutor = new
//                    {
//                        c.Tutor.User.Name,
//                        c.Tutor.User.Gender
//                    },
//                    Schedules = c.Schedules.Select(s => new
//                    {
//                        s.Date,
//                        s.StartTime,
//                        s.EndTime
//                    })
//                })
//                .ToListAsync();

//            var jsonResult = Json(result);
//            return jsonResult;
//        }


//    }
//}
