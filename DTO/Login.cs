using System.ComponentModel.DataAnnotations;
namespace BE_Tutor.DTO
{
    public class Login
    {
        [Required]
        public string Phone { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
