namespace FindTutor_MVC.Models
{
    public class OtpVerifications
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Phone { get; set; }

        //public string Email? { get; set; }
        public string OtpCode { get; set; }
        public string Purpose { get; set; }
        public DateTime ExpiredAt { get; set; }
    }
}
