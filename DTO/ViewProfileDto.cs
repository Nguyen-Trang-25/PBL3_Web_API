namespace BE_Tutor.DTO
{
    public class ViewProfileDto
    {
        public string? Name { get; set; }
        public bool? Gender { get; set; }
        public string? Email { get; set; }
        // phone xử lí riêng
        public string? Workplace { get; set; }
        public int? Age { get; set; }
    }
}
