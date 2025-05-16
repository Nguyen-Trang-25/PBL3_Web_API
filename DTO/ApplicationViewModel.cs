using System.ComponentModel.DataAnnotations;

namespace BE_Tutor.DTO
{
    public class ApplicationViewModel
    {
        [Required]
        public string RequestId { get; set; } = null!;

        [Required]
        public string TutorId { get; set; } = null!;

        [Required]
        public string FullName { get; set; } = null!;

        [Required, EmailAddress]
        public string Email { get; set; } = null!;

        [Required, Phone]
        public string Phone { get; set; } = null!;

        [Required]
        public string Specialization { get; set; } = null!;

        public string Qualification { get; set; } = null!;

        public string Experience { get; set; } = null!;

        public string TeachingArea { get; set; } = null!;

        public string TeachingFormat { get; set; } = "Online"; // Default

        public bool Gender { get; set; } = false;

    }
}
