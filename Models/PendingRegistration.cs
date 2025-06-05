namespace BE_Tutor.Models
{
    public class PendingRegistration
    {
        public int Id { get; set; }
        public string Phone { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string Role { get; set; } = null!;
        public string OtpCode { get; set; } = null!;
        public DateTime ExpiredAt { get; set; }
    }
}
