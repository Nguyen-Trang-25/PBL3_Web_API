namespace FindTutor_MVC.Models.ViewModels
{
    public class PasswordDto
    {
        public string Phone { get; set; }
        public string OtpCode { get; set; }
        public string NewPass { get; set; }
        public string ConfirmNew { get; set; }
        public string? Purpose { get; set; }
    }
}
