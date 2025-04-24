using System.ComponentModel.DataAnnotations;
namespace FindTutor_MVC.Models.ViewModels
{
    public class Register
    {
        [Required]
        public string Phone { get; set; }
        [Required]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Mật khẩu phải từ 8 ký tự trở lên")]
        public string Password { get; set; }

        [Required]
        [DataType(DataType.Password)]// khi render se dc blind 
        [Compare("Password", ErrorMessage = "Mật khẩu và xác nhận mật khẩu không khớp")]
        public string ConfirmPassword { get; set; }
        [
        Required]
        public string Role { get; set; }

    }
}
