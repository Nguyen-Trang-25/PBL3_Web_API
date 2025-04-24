using System.ComponentModel.DataAnnotations;
namespace FindTutor_MVC.Models.ViewModels
{
    public class Login
    {
        [Required]
        public string Phone { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
