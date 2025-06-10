namespace BE_Tutor.DTO
{
    public class EditMyProfileDto
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public bool? Gender { get; set; }

        // Dành cho Tutor
        public string? Education { get; set; }
        public string? Experience { get; set; }
        public string? Subjects { get; set; }

        // Dành cho Student
        public string? Grade { get; set; }
        public string? School { get; set; }
    }
}
