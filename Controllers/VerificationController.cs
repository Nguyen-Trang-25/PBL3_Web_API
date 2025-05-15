using BE_Tutor.DTO;
using BE_Tutor.Helpers;
using BE_Tutor.Models;
using BE_Tutor.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace BE_Tutor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VerificationController : ControllerBase
    {
            private readonly ApplicationDbContext _context;
            private readonly IOtpService _otpService;
            public VerificationController(ApplicationDbContext context, IOtpService otpService)
            {
                _context = context;
                _otpService = otpService;// DI: inject
            }

            [Authorize]//force to user login
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

            [Authorize]//force to user login
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
            // ng dùng quên pass
            [AllowAnonymous]
            [HttpPost("ForgotPassword")]
            public async Task<IActionResult> RequestPass([FromBody] ChangePhone dto)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Phone == dto.Newphone);
                if (user == null)
                    return NotFound(new { message = "Không tìm thấy người dùng với số điện thoại này." });

                var otp = await _otpService.RequestOtpAsync(user.UserId, dto.Newphone, "Forgot Password");

                return Ok(new { message = "OTP đã được gửi." });

            }
            //ng dùng muốn đổi pass chứ kh phải quên
            [Authorize]
            [HttpPost("ResetPassword")]
            public async Task<IActionResult> RequestResetPassword([FromBody] ChangePhone dto)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Phone == dto.Newphone);
                if (user == null)
                    return NotFound(new { message = "Không tìm thấy người dùng với số điện thoại này." });

                var otp = await _otpService.RequestOtpAsync(user.UserId, dto.Newphone, "Reset Password");

                return Ok(new { message = "OTP đã được gửi." });
            }

            //quên
            [AllowAnonymous]
            [HttpPut("ChangeForgot")]
            public async Task<IActionResult> ResetPassword([FromBody] PasswordDto dto)
            {
                if (dto.NewPass != dto.ConfirmNew)
                    return BadRequest(new { message = "Mật khẩu xác nhận không khớp." });

                var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Phone == dto.Phone);
                if (user == null)
                    return NotFound(new { message = "Không tìm thấy người dùng." });

                var isValidOtp = await _otpService.VerifyOtpAsync(dto.Phone, dto.OtpCode, "Forgot Password");
                if (!isValidOtp)
                    return BadRequest(new { message = "Mã OTP không hợp lệ hoặc đã hết hạn." });

                user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPass);

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Đổi mật khẩu thành công." });
            }// có thể tách ra để clean. Nhưng sau tính


            // đổi
            [Authorize]
            [HttpPut("ChangeReset")]
            public async Task<IActionResult> ChangeReset([FromBody] PasswordDto dto)
            {
                if (dto.NewPass != dto.ConfirmNew)
                    return BadRequest(new { message = "Mật khẩu xác nhận không khớp." });

                var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Phone == dto.Phone);
                if (user == null)
                    return NotFound(new { message = "Không tìm thấy người dùng." });

                var isValidOtp = await _otpService.VerifyOtpAsync(dto.Phone, dto.OtpCode, "Reset Password");
                if (!isValidOtp)
                    return BadRequest(new { message = "Mã OTP không hợp lệ hoặc đã hết hạn." });

                user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPass);

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Đổi mật khẩu thành công." });
            }// có thể tách ra để clean. Nhưng sau tính

           
        }
    }

