namespace BE_Tutor.DTO
{
    public class AddUserdto
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string Phone { get; set; }
        public string? Address { get; set; }
        public string? Role { get; set; }
        public string? UserType { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public bool? Gender { get; set; }

        // Tutor-specific
        public string? Education { get; set; }
        public string? Experience { get; set; }
        public string? Subjects { get; set; }

        // Student-specific
        public string? Grade { get; set; }
        public string? School { get; set; }
    }
}
