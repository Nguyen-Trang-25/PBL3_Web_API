using FindTutor_MVC.Models;
using FindTutor_MVC.Models.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
namespace FindTutor_MVC.Controllers
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
            if (lastUser != null && int.TryParse(lastUser.UserId, out int lastId))
            {
                nextId = lastId + 1;  // Tăng giá trị ID của người dùng cuối cùng
            }

            // Tạo UserId đảm bảo có đủ 10 ký tự
            string newUserId = nextId.ToString("D10");  // D10 đảm bảo ID có đủ 10 chữ số

            // Tạo đối tượng người dùng
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
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Phone == model.Phone);
            if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.Password))
                return Unauthorized(new { message = "Sai số điện thoại hoặc mật khẩu" });

            var token = GenerateJwtToken(user);// tao token de xac thuc ng dung. client se sd token nay de thuc hien cac yeu cau toi api ma ko can dang nhap lai
            return Ok(new { token });

        }

       
        private string GenerateJwtToken(User user)
        {
            var claims = new[]

            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId),// gán id vào token
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(ClaimTypes.MobilePhone, user.Phone)

            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));// tao ra khoa bi mat
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiresInMinutes),
                signingCredentials: creds// la phần chữ kí tạo ra từ creds
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}