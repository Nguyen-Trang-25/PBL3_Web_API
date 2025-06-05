using BE_Tutor.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using BE_Tutor.DTO;
using BE_Tutor.Models;
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

        [HttpPost("RequestRegister")]
     public async Task<IActionResult> RequestRegister([FromBody] RegisterRequestDto dto)
        {
            if (_context.Users.Any(u => u.Phone == dto.Phone))
                return BadRequest(new { message = "Số điện thoại đã được đăng ký" });

            if (_context.PendingRegistrations.Any(p => p.Phone == dto.Phone))
                return BadRequest(new { message = "Bạn đã gửi yêu cầu đăng ký. Vui lòng xác nhận OTP." });

            string otp = OtpHelper.GenerateSecureOtp();
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var pending = new PendingRegistration
            {
                Phone = dto.Phone,
                PasswordHash = hashedPassword,
                Role = dto.Role,
                OtpCode = otp,
                ExpiredAt = DateTime.UtcNow.AddMinutes(5)
            };

            _context.PendingRegistrations.Add(pending);
            await _context.SaveChangesAsync();

            // Gửi OTP đến điện thoại (code gửi SMS, hoặc giả lập)
            // await SmsService.SendOtpAsync(dto.Phone, otp);

            return Ok(new { message = "OTP đã được gửi đến số điện thoại." });
        }


        [HttpPost("ConfirmRegister")]
        public async Task<IActionResult> ConfirmRegister([FromBody] ConfirmRegisterDto dto)
        {
            var pending = await _context.PendingRegistrations
                .FirstOrDefaultAsync(p => p.Phone == dto.Phone && p.OtpCode == dto.OtpCode && p.ExpiredAt > DateTime.UtcNow);

            if (pending == null)
                return BadRequest(new { message = "OTP không hợp lệ hoặc đã hết hạn." });

            if (_context.Users.Any(u => u.Phone == dto.Phone))
            {
                _context.PendingRegistrations.Remove(pending);
                await _context.SaveChangesAsync();
                return BadRequest(new { message = "Số điện thoại đã được đăng ký" });
            }

            var lastUser = await _context.Users.OrderByDescending(u => u.UserId).FirstOrDefaultAsync();

            int nextId = 1;
            if (lastUser != null && int.TryParse(lastUser.UserId, out int lastId))
            {
                nextId = lastId + 1;
            }
            string newUserId = nextId.ToString("D10");

            var user = new User
            {
                UserId = newUserId,
                Phone = pending.Phone,
                Password = pending.PasswordHash,
                Role = pending.Role
            };
            _context.Users.Add(user);

            if (pending.Role == "student")
            {
                _context.Students.Add(new Student
                {
                    StudentId = newUserId, // nếu bạn dùng newUserId làm khóa chính luôn
                    UserId = newUserId
                });
            }
            else if (pending.Role == "tutor")
            {
                _context.Tutors.Add(new Tutor
                {
                    TutorId = newUserId,
                    UserId = newUserId
                });

            }

            _context.PendingRegistrations.Remove(pending);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đăng ký thành công" });
        }


        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] Login model)
        {
//<<<<<<< HEAD
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

//=======
            //var user = await _context.Users.FirstOrDefaultAsync(u => u.Phone == model.Phone);
            //if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.Password))
            //    return Unauthorized(new { message = "Sai số điện thoại hoặc mật khẩu" });

            //var token = GenerateJwtToken(user);// tao token de xac thuc ng dung. client se sd token nay de thuc hien cac yeu cau toi api ma ko can dang nhap lai
//>>>>>>> 08f2fa143277a40efd9dee229e52a73ad524a14f
            return Ok(new { token });

        }

        //<<<<<<< HEAD
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
            //=======
            /*[Authorize]
            [HttpPost("Logout")]
            public async Task<IActionResult> Logout()
            {
                var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

                if (string.IsNullOrEmpty(token))
                    return BadRequest(new { message = "Token không hợp lệ" });



            }
           */
            //}

            //        private string GenerateJwtToken(User user)
            //        {
            //            var claims = new[]

            //            {
            //                new Claim(ClaimTypes.NameIdentifier, user.UserId),// gán id vào token
            //                new Claim(ClaimTypes.Role, user.Role),
            //                new Claim(ClaimTypes.MobilePhone, user.Phone)

            //            };

            //            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));// tao ra khoa bi mat
            ////>>>>>>> 08f2fa143277a40efd9dee229e52a73ad524a14f
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