using System.Security.Cryptography;

namespace FindTutor_MVC.Helpers
{
    public class OtpHelper
    {
        public static string GenerateSecureOtp()
        {
            var bytes = new byte[4];
            RandomNumberGenerator.Fill(bytes);
            int value = BitConverter.ToInt32(bytes, 0) & 0x7FFFFFFF;
            return (value % 900000 + 100000).ToString();
        }
    }
}
