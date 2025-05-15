using BE_Tutor.Models;
//using FindTutor_MVC.Models.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using BE_Tutor.DTO;
namespace BE_Tutor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;// khai báo đối tượng
        private readonly JwtSettings _jwtSettings;

        public AuthController(ApplicationDbContext context, IOptions<JwtSettings> jwt)
        {
            _context = context;
            _jwtSettings = jwt.Value;// lay gia tri thuc cua cau hinh
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] Register model)
        {
            if (_context.Users.Any(u => u.Phone == model.Phone))
                return BadRequest(new { message = "Số điện thoại đã được đăng ký" });

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(model.Password);

            var lastUser = await _context.Users
                .OrderByDescending(u => u.UserId)
                .FirstOrDefaultAsync();

            int nextId = 1;
            if (lastUser != null && int.TryParse(lastUser.UserId.Substring(1), out int lastId))
            {
                nextId = lastId + 1;
            }

            string newUserId = "U" + nextId.ToString("D3");
            var user = new User
            {
                UserId = newUserId,
                Phone = model.Phone,
                Password = hashedPassword,
                Role = model.Role
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();// chỉ lần lưu vào db, k cần chờ nó lưu xong mà vẫn làm việc khác dc

            return Ok(new { message = "Đăng ký thành công" });
        }



        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] Login model)
        {
            var user = await _context.Users
                .Where(u => u.Phone == model.Phone)
                .FirstOrDefaultAsync();

            if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.Password))
                return Unauthorized(new { message = "Sai số điện thoại hoặc mật khẩu" });

            // Tìm studentId (nếu có)
            var student = await _context.Students
                .Where(s => s.UserId == user.UserId)
                .Select(s => s.StudentId)
                .FirstOrDefaultAsync();

            // Tìm tutorId (nếu có)
            var tutor = await _context.Tutors
                .Where(t => t.UserId == user.UserId)
                .Select(t => t.TutorId)
                .FirstOrDefaultAsync();

            var token = GenerateJwtToken(user, student, tutor);

            return Ok(new { token });
        }

        private string GenerateJwtToken(User user, string? studentId, string? tutorId)
        {
            var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.UserId),
        new Claim(ClaimTypes.Role, user.Role),
        new Claim(ClaimTypes.MobilePhone, user.Phone),
    };

            if (!string.IsNullOrEmpty(studentId))
                claims.Add(new Claim("studentId", studentId));
            if (!string.IsNullOrEmpty(tutorId))
                claims.Add(new Claim("tutorId", tutorId));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiresInMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

       
    }
}


