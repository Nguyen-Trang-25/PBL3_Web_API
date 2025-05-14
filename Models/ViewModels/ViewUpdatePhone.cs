using System.ComponentModel.DataAnnotations;
namespace FindTutor_MVC.Models.ViewModels

{
    public class ViewUpdatePhone// to user enter
    {
        [Required]
        [Phone]// attribute to notify error when newphone invalid
        public string NewPhone { get; set; }
        public string OtpCode { get; set; }
    }
}
