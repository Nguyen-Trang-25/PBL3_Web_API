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
            var phoneExists = await _context.Users
            .AnyAsync(u => u.Phone == newPhone.Newphone && u.UserId != UserId);

            if (phoneExists)
            {
                return BadRequest(new { message = "Số điện thoại này đã được sử dụng bởi người dùng khác." });
            }

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
                        ExpiredAt = DateTime.UtcNow.AddMinutes(3)
                    };

                    _context.OtpVerifications.Add(verification);
                    await _context.SaveChangesAsync();
                }
            ////// place to code send sms
            return Ok(new { message = "OTP đã được gửi đến số điện thoại mới." });
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

            try
            {
                await _otpService.RequestOtpAsync(user.UserId, dto.Newphone, "Forgot Password");
                return Ok(new { message = "OTP đã được gửi." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message }); // Trả thông báo lỗi rõ ràng
            }
            catch (Exception ex)
            {
                // Đề phòng lỗi khác (ví dụ DB), không lộ thông tin nhạy cảm
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi gửi OTP." });
            }
            }
        // thay đổi mật khẩu
        [Authorize]
        [HttpPost("RequestChangePassword")]
        public async Task<IActionResult> RequestChangePassword([FromBody] ChangePasswordOtpRequest dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return Unauthorized(new { message = "Không tìm thấy người dùng." });

            var isValidPassword = BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.Password);// so sánh ng dùng nhập mật khẩu hiện tại có đúng k 
            if (!isValidPassword)
                return BadRequest(new { message = "Mật khẩu hiện tại không chính xác." });

            // Kiểm tra OTP còn hiệu lực?
            var existingOtp = await _context.OtpVerifications.FirstOrDefaultAsync(x =>
                x.UserId == userId &&
                x.Purpose == "Change Password" &&
                x.ExpiredAt > DateTime.UtcNow);

            if (existingOtp != null)
                return BadRequest(new { message = "Mã OTP hiện tại vẫn còn hiệu lực." });

            // Tạo OTP
            var otp = OtpHelper.GenerateSecureOtp();

            var otpRecord = new OtpVerifications
            {
                UserId = userId,
                Phone = user.Phone,
                Purpose = "Change Password",
                OtpCode = otp,
                ExpiredAt = DateTime.UtcNow.AddMinutes(3),
                ExtraData = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword) // ⚠️ Lưu tạm newPassword
            };

            _context.OtpVerifications.Add(otpRecord);
            await _context.SaveChangesAsync();

            // TODO: Gửi OTP qua SMS/Email

            return Ok(new { message = "Mã OTP đã được gửi để xác nhận đổi mật khẩu." });
        }

        [Authorize]
        [HttpPost("VerifyChangePasswordOtp")]
        public async Task<IActionResult> VerifyChangePasswordOtp([FromBody] VerifyOtpDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Không xác thực được người dùng." });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng." });

            // Tìm OTP khớp với người dùng, mục đích "Change Password", chưa hết hạn
            var otpRecord = await _context.OtpVerifications
                .Where(x =>
                    x.UserId == userId &&
                    x.Phone == user.Phone &&
                    x.Purpose == "Change Password" &&
                    x.ExpiredAt > DateTime.UtcNow)
                .FirstOrDefaultAsync();

            if (otpRecord == null || otpRecord.OtpCode != dto.OtpCode)
            {
                return BadRequest(new { message = "Mã OTP không hợp lệ hoặc đã hết hạn." });
            }

            // Cập nhật mật khẩu mới đã được hash lưu trong ExtraData
            user.Password = otpRecord.ExtraData;
            _context.Users.Update(user);

            // Xóa OTP sau khi dùng
            _context.OtpVerifications.Remove(otpRecord);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đổi mật khẩu thành công." });
        }


        //xac thuc OTP
        [AllowAnonymous]
           [HttpPost("VerifyOtp")]
           public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
           {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Phone == dto.Phone);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng." });

            var isValidOtp = await _otpService.VerifyOtpAsync(dto.Phone, dto.OtpCode, "Forgot Password");
            if (!isValidOtp)
                return BadRequest(new { message = "Mã OTP không hợp lệ hoặc đã hết hạn." });

            return Ok(new { message = "OTP hợp lệ." });
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

                user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPass);

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Đổi mật khẩu thành công." });
            }// có thể tách ra để clean. Nhưng sau tính


            // đổi
            
           
        }
    }

