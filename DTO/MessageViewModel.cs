using System.ComponentModel.DataAnnotations;

namespace BE_Tutor.DTO
{
    public class MessageViewModel
    {
        [Required]
        public string SenderId { get; set; } = null!;

        [Required]
        public string ReceiverId { get; set; } = null!;

        [Required]
        [StringLength(1000, ErrorMessage = "Nội dung tin nhắn không được vượt quá 1000 ký tự.")]
        public string Content { get; set; } = null!;
    }
}
