using FindTutor_MVC.Helpers;
using FindTutor_MVC.Models;
using Microsoft.EntityFrameworkCore;

namespace FindTutor_MVC.Services
{
    public class OtpService : IOtpService
    {
        public readonly ApplicationDbContext _context;

        public OtpService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<string> RequestOtpAsync(string userId, string phone, string purpose)
        {
            var existingOtp = await _context.OtpVerifications.FirstOrDefaultAsync(x =>
            x.Phone == phone &&
            x.Purpose == purpose &&
            x.ExpiredAt > DateTime.UtcNow);

            if (existingOtp != null)
                return existingOtp.OtpCode;
        
        string otp = OtpHelper.GenerateSecureOtp();

            var verification = new OtpVerifications
            {
                UserId = userId,
                Phone = phone,
                OtpCode = otp,
                Purpose = purpose,
                ExpiredAt = DateTime.UtcNow.AddMinutes(5)
            };

            _context.OtpVerifications.Add(verification);
            await _context.SaveChangesAsync();

            return otp;
        }

        public async Task<bool> VerifyOtpAsync(string phone, string code, string purpose)
        {
            var record = await _context.OtpVerifications.FirstOrDefaultAsync(x =>
            x.Phone == phone &&
            x.OtpCode == code &&
            x.Purpose == purpose &&
            x.ExpiredAt > DateTime.UtcNow);

            if (record == null)
                return false;

            _context.OtpVerifications.Remove(record);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
