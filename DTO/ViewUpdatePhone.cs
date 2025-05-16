using System.ComponentModel.DataAnnotations;

namespace BE_Tutor.DTO
{
    public class ViewUpdatePhone
    {
        [Required]
        [Phone]// attribute to notify error when newphone invalid
        public string NewPhone { get; set; }
        public string OtpCode { get; set; }
    }
}
