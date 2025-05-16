namespace BE_Tutor.Service
{
    public interface IOtpService
    {
        Task<string> RequestOtpAsync(string userId, string phone, string purpose);
        Task<bool> VerifyOtpAsync(string phone, string code, string purpose);
    }
}
