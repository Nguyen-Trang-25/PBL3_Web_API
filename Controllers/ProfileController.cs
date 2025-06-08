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
            var users = await _context.Users
                .Where(u => u.Status == null || u.Status != "inactive") // 👈 lọc user chưa bị "xóa mềm"
                .Select(u => new
                {
                    id = u.UserId,
                    fullName = u.Name,
                    userType = u.Role,
                    email = u.Email,
                    phone = u.Phone,
                    joinDate = u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPost("Add")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> AddUser([FromBody] AddUserdto dto)
        {
            if (string.IsNullOrEmpty(dto.Phone))
                return BadRequest("Số điện thoại là bắt buộc.");

            // Kiểm tra số điện thoại đã tồn tại
            bool phoneExists = await _context.Users.AnyAsync(u => u.Phone == dto.Phone);
            if (phoneExists)
                return Conflict(new { message = "Số điện thoại đã tồn tại." });

            // Sinh UserId dạng 10 số (vd: "0000000001")
            var lastUser = await _context.Users
                .OrderByDescending(u => u.UserId)
                .FirstOrDefaultAsync();

            int nextId = 1;
            if (lastUser != null && int.TryParse(lastUser.UserId, out int lastId))
            {
                nextId = lastId + 1;
            }
            string newUserId = nextId.ToString("D10");

            // Tạo mật khẩu mặc định và hash bằng BCrypt
            string defaultPassword = "123456";
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(defaultPassword);

            var newUser = new User
            {
                UserId = newUserId,
                Name = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,
                Role = dto.UserType.ToLower(),
                Address = dto.Address,
                Gender = dto.Gender,
                Status = "active",
                DateOfBirth = dto.DateOfBirth,
                CreatedAt = DateTime.UtcNow,
                Password = hashedPassword
            };
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            if (dto.UserType == "tutor")
            {
                var tutor = new Tutor
                {
                    TutorId = newUserId,
                    Education = dto.Education,
                    Experience = dto.Experience
                };

                if (!string.IsNullOrEmpty(dto.Subjects))
                {
                    var subject = await _context.Subjects.FirstOrDefaultAsync(s => s.Name == dto.Subjects);

                    if (subject == null)
                    {
                        var lastSubject = await _context.Subjects
                            .OrderByDescending(s => s.SubjectId)
                            .FirstOrDefaultAsync();

                        var newSubjectId = lastSubject == null
                            ? "001"
                            : (int.Parse(lastSubject.SubjectId) + 1).ToString("D3");

                        subject = new Subject
                        {
                            SubjectId = newSubjectId,
                            Name = dto.Subjects
                        };

                        _context.Subjects.Add(subject);
                        await _context.SaveChangesAsync();
                    }

                    tutor.SpecialtySubjectId = subject.SubjectId;
                }

                newUser.Tutors.Add(tutor);
            }
            else if (dto.UserType == "student")
            {
                var student = new Student
                {
                    StudentId = newUserId,
                    GradeLevel = dto.Grade,
                    School = dto.School
                };

                newUser.Students.Add(student);
            }

           

            return Ok(new { message = "Thêm người dùng thành công" });
        }

        [HttpPut("Edit")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> EditUser([FromBody] EditUserDto dto)
        {
            var user = await _context.Users
                .Include(u => u.Tutors)
                    .ThenInclude(t => t.SpecialtySubject)
                .Include(u => u.Students)
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
                var tutor = user.Tutors.FirstOrDefault();
                if (tutor == null)
                {
                    tutor = new Tutor { UserId = user.UserId };
                    user.Tutors.Add(tutor);
                }

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

                // Xóa hết student nếu có
                user.Students.Clear();
            }
            else if (dto.UserType == "Student")
            {
                var student = user.Students.FirstOrDefault();
                if (student == null)
                {
                    student = new Student { UserId = user.UserId };
                    user.Students.Add(student);
                }

                if (!string.IsNullOrEmpty(dto.Grade))
                    student.GradeLevel = dto.Grade;

                if (!string.IsNullOrEmpty(dto.School))
                    student.School = dto.School;

                // Xóa hết tutor nếu có
                user.Tutors.Clear();
            }
            else
            {
                // Nếu không phải Tutor hoặc Student thì xóa hết cả hai
                user.Tutors.Clear();
                user.Students.Clear();
            }

            await _context.SaveChangesAsync();
            return Ok("Cập nhật người dùng thành công.");
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

            var student = user.Students.FirstOrDefault();
            var tutor = user.Tutors.FirstOrDefault();

            return Ok(new
            {
                id = user.UserId,
                fullName = user.Name ?? "",
                Email = user.Email ?? "",
                phone = user.Phone,
                status = user.Status,
                joinDate = user.CreatedAt,
                role = user.Role,
                gender = user.Gender,
                Address = user.Address ?? "",
                DateOfBirth = user.DateOfBirth, // DateTime?, trả về chuẩn ISO8601

                // Thông tin thêm cho tutor
                Education = tutor?.Education ?? "",
                Experience = tutor?.Experience ?? "",
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


        [HttpDelete("Delete/{id}")]
            [Authorize(Roles = "admin")]
            public async Task<IActionResult> DeleteUser(string id)
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null) return NotFound(new { message = "Người dùng không tồn tại." });

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Xóa người dùng thành công." });
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
            
        }
    }



