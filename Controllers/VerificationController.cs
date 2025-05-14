using FindTutor_MVC.Models;
using FindTutor_MVC.Models.ViewModels;
using FindTutor_MVC.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
namespace FindTutor_MVC.Controllers
{
    [Route("api/[controller]")]// create url
    [ApiController]//  auto Validate Modelstate,...
    [Authorize]//force to user login
    public class VerificationController : Controller
    {
        private readonly ApplicationDbContext _context;
        public VerificationController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("RequestChangePhone")]
        public async Task<IActionResult> RequestChangePhone([FromBody] ChangePhone newPhone)
        {
            var UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            // check hieu luc otp
            var existOtp = await _context.OtpVerifications
                .FirstOrDefaultAsync(u =>
                u.UserId == UserId &&
                u.Phone == newPhone.Newphone &&
                u.Purpose == "Update Phone" &&
                u.ExpiredAt > DateTime.UtcNow);
            string otp;

            if (existOtp != null)
                otp = existOtp.OtpCode;
            else
            {
                otp = OtpHelper.GenerateSecureOtp();
                var verification = new OtpVerifications
                {
                    UserId = UserId,
                    Phone = newPhone.Newphone,
                    Purpose = "Update Phone",
                    OtpCode = otp,
                    ExpiredAt = DateTime.UtcNow.AddMinutes(5)
                };

                _context.OtpVerifications.Add(verification);
                await _context.SaveChangesAsync();
            }

               ////// place to code send sms

            

            return Ok(new { messgage = "OTP đã được gửi đến số điện thoại mới." });
        }

        [HttpPut("ConfirmChangePhone")]
        public async Task<IActionResult> ConfirmChangePhone([FromBody] ConfirmChangePhone dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            //check otp co hieu luc
            var otpRecord = await _context.OtpVerifications
                .FirstOrDefaultAsync(u =>
                u.UserId == userId &&
                u.Phone == dto.newPhone &&
                u.OtpCode == dto.OtpCode &&
                u.ExpiredAt > DateTime.UtcNow &&
                u.Purpose == "Update Phone");

            if (otpRecord == null)
            {
                return BadRequest(new { message = "Mã OTP không hợp lệ hoặc đã hết hạn." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
            {
                return NotFound(new { message = "Không tìm thấy người dùng." });
            }

            user.Phone = dto.newPhone;

            _context.Users.Update(user);

            // delete otp was used
            _context.OtpVerifications.Remove(otpRecord);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật số điện thoại thành công." });
        }
        public IActionResult Index()
        {
            return View();
        }
    }
}
