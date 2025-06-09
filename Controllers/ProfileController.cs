using BE_Tutor.DTO;
using BE_Tutor.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace BE_Tutor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        
            private readonly ApplicationDbContext _context;
            public ProfileController(ApplicationDbContext context)
            {
                _context = context;
            }

        [HttpGet("GetAllUsers")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var rawUsers = await _context.Users
         .Where(u => u.Status == null || u.Status != "inactive")
         .Include(u => u.Tutors.Where(t => t.IsActive))
                 .ThenInclude(t => t.SpecialtySubject)
         .Include(u => u.Students.Where(s => s.IsActive))
         .ToListAsync();

            var users = rawUsers.Select(u =>
            {
                var tutor = u.Tutors.FirstOrDefault();
                var student = u.Students.FirstOrDefault();
                var role = u.Role?.ToLower();
                return new
                {
                    id = u.UserId,
                    fullName = u.Name,
                    userType = u.Role,
                    email = u.Email,
                    phone = u.Phone,
                    joinDate = u.CreatedAt,

                    // Chỉ thêm nếu là tutor
                    education = role == "tutor" ? tutor?.Education : null,
                    experience = role == "tutor" ? tutor?.Experience : null,
                    subjects = role == "tutor" ? tutor?.SpecialtySubject?.Name : null,

                    // Chỉ thêm nếu là student
                    grade = role == "student" ? student?.GradeLevel : null,
                    school = role == "student" ? student?.School : null
                };
            }).ToList();

            return Ok(users);
        }

            [HttpPut("Edit")]
            [Authorize(Roles = "admin")]
            public async Task<IActionResult> EditUser([FromBody] EditUserDto dto)
            {
            var user = await _context.Users
              .Include(u => u.Tutors.Where(t => t.IsActive))
                  .ThenInclude(t => t.SpecialtySubject)
              .Include(u => u.Students.Where(s => s.IsActive))
              .FirstOrDefaultAsync(u => u.UserId == dto.Id);

            if (user == null)
                    return NotFound("Không tìm thấy người dùng.");

                if (!string.IsNullOrEmpty(dto.FullName))
                    user.Name = dto.FullName;

                if (!string.IsNullOrEmpty(dto.Email))
                    user.Email = dto.Email;

                if (!string.IsNullOrEmpty(dto.Phone))
                    user.Phone = dto.Phone;

                if (!string.IsNullOrEmpty(dto.Address))
                    user.Address = dto.Address;

                if (!string.IsNullOrEmpty(dto.UserType))
                    user.Role = dto.UserType;

                if (dto.DateOfBirth.HasValue)
                    user.DateOfBirth = dto.DateOfBirth.Value;

                if (dto.Gender.HasValue)
                    user.Gender = dto.Gender.Value;

                // Cập nhật thông tin role-specific
                if (dto.UserType == "tutor")
                {
                var student = user.Students.FirstOrDefault(s => s.IsActive);
                if (student != null)
                {
                    student.IsActive = false;
                }

                // Lấy hoặc tạo Tutor
                var tutor = user.Tutors.FirstOrDefault();
                if (tutor == null)
                {
                    tutor = new Tutor { 
                        UserId = user.UserId,
                        TutorId = user.UserId
                    };
                    user.Tutors.Add(tutor);
                }

                tutor.IsActive = true;

                if (!string.IsNullOrEmpty(dto.Education))
                        tutor.Education = dto.Education;

                    if (!string.IsNullOrEmpty(dto.Experience))
                        tutor.Experience = dto.Experience;

                    if (!string.IsNullOrEmpty(dto.Subjects))
                    {
                        // Tìm Subject đã có trong DB theo tên
                        var subject = await _context.Subjects.FirstOrDefaultAsync(s => s.Name == dto.Subjects);

                        if (subject != null)
                        {
                            tutor.SpecialtySubjectId = subject.SubjectId;
                        }
                        else
                        {
                            // Tạo SubjectId mới theo kiểu 3 ký tự số (001, 002,...)
                            var lastSubject = await _context.Subjects
                                .OrderByDescending(s => s.SubjectId)
                                .FirstOrDefaultAsync();

                            string newId;
                            if (lastSubject == null)
                            {
                                newId = "001";
                            }
                            else
                            {
                                int lastIdNum = int.Parse(lastSubject.SubjectId);
                                newId = (lastIdNum + 1).ToString("D3"); // "D3" là format 3 chữ số có số 0 đứng trước
                            }

                            var newSubject = new Subject
                            {
                                SubjectId = newId,
                                Name = dto.Subjects
                            };

                            _context.Subjects.Add(newSubject);
                            await _context.SaveChangesAsync();

                            tutor.SpecialtySubjectId = newSubject.SubjectId;
                        }
                    }

                
                }
                else if (dto.UserType == "student")
                {
                var tutor = user.Tutors.FirstOrDefault(t => t.IsActive);
                if (tutor != null)
                {
                    tutor.IsActive = false;
                }

                // Lấy hoặc tạo Student
                var student = user.Students.FirstOrDefault();
                if (student == null)
                {
                    student = new Student
                    {
                        UserId = user.UserId,
                        StudentId = user.UserId
                    };
                    user.Students.Add(student);
                }

                student.IsActive = true;

                if (!string.IsNullOrEmpty(dto.Grade))
                        student.GradeLevel = dto.Grade;

                    if (!string.IsNullOrEmpty(dto.School))
                        student.School = dto.School;

                  
                }
                

                await _context.SaveChangesAsync();
                return Ok("Cập nhật người dùng thành công.");
            }
        [HttpPost("Delete")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteUser([FromBody] string userId)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest(new { message = "UserId không được để trống." });

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == userId && (u.Status == null || u.Status != "inactive"));

            if (user == null)
                return NotFound(new { message = "Người dùng không tồn tại hoặc đã bị xóa." });

            user.Status = "inactive"; // Đánh dấu đã xóa

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã đánh dấu xóa người dùng '{user.Name}' thành công." });
        }


        [HttpGet("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _context.Users
        .Include(u => u.Tutors)
            .ThenInclude(t => t.SpecialtySubject) // Bao gồm Subject để lấy tên môn học
        .Include(u => u.Students)
        .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
            {
                return NotFound(new { message = "Người dùng không tồn tại." });
            }

            var student = user.Students.FirstOrDefault(s => s.IsActive);
            var tutor = user.Tutors.FirstOrDefault(t => t.IsActive);

            return Ok(new
            {
                id = user.UserId,
                fullName = user.Name ?? "",
                email = user.Email ?? "",
                phone = user.Phone,
                status = user.Status,
                joinDate = user.CreatedAt,
                role = user.Role,
                gender = user.Gender,
                address = user.Address ?? "",
                DateOfBirth = user.DateOfBirth?.ToString("yyyy-MM-dd"), // DateTime?, trả về chuẩn ISO8601

                // Thông tin thêm cho tutor
                education = tutor?.Education ?? "",
                experience = tutor?.Experience ?? "",
                subjects = tutor?.SpecialtySubject?.Name ?? "",

                // Thông tin thêm cho student
                grade = student?.GradeLevel ?? "",
                school = student?.School ?? "",


                userType = student != null ? "student" :
                           tutor != null ? "tutor" :
                           user.Role // fallback là role, lấy vai trò định sẵn

                // Có thể thêm các trường khác nếu cần
            });
        }

        // xóa batch
        [HttpPost("DeleteBatch")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteBatch([FromBody] List<string> userIds)
        {
            if (userIds == null || userIds.Count == 0)
                return BadRequest(new { message = "Danh sách userIds không được để trống." });

            var usersToDelete = await _context.Users
                .Where(u => userIds.Contains(u.UserId) && (u.Status == null || u.Status != "inactive"))
                .ToListAsync();

            if (usersToDelete.Count == 0)
                return NotFound(new { message = "Không tìm thấy người dùng phù hợp để xóa." });

            foreach (var user in usersToDelete)
            {
                user.Status = "inactive"; // đánh dấu trạng thái Deleted
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã đánh dấu xóa {usersToDelete.Count} người dùng thành công." });
        }


        
        // ng dung xem pro5 cua minh
        [HttpGet("GetMyUser")]
            public async Task<IActionResult> GetProfile()
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var user = await _context.Users
                    .Where(u => u.UserId == userId)
                    .Select(u => new
                    {
                        u.Name,
                        u.Gender,
                        u.Phone,
                        u.Email,
                        u.Status,
                        u.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                    return NotFound(new { message = "Không tìm thấy người dùng." });
                return Ok(user);
            }

            [HttpPut("UpdateMyUser")]
            public async Task<IActionResult> UpdateMyProfile([FromBody] ViewProfileDto dto)
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

                if (user == null)
                    return NotFound(new { message = "Không tìm thấy người dùng." });
                               
                if (!string.IsNullOrWhiteSpace(dto.Name))
                    user.Name = dto.Name;

                if (!string.IsNullOrWhiteSpace(dto.Email))
                    user.Email = dto.Email;

                if (dto.Gender.HasValue)
                    user.Gender = dto.Gender;


                _context.Users.Update(user);
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Cập nhật thông tin thành công." });
            }
        [HttpGet("stats")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalUsers = await _context.Users.CountAsync(); // Tính cả inactive
           // var totalCourses = await _context.Classes.CountAsync(); // Nếu bạn dùng bảng tên khác, sửa lại
            //var totalReviews = await _context.Reviews.CountAsync(); // Tuỳ bảng tên

            // Trạng thái hệ thống có thể là mô phỏng hoặc lấy từ logic khác
            var systemStatus = "online";

            return Ok(new
            {
                users = totalUsers,
                //courses = totalCourses,
                //reviews = totalReviews,
                systemStatus
            });
        }



    }
}



