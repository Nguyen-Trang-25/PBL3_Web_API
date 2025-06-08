namespace BE_Tutor.DTO
{
    public class PartnerDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Role { get; set; }
        public string AvatarUrl { get; set; }
        public string Status { get; set; }
        public DateTime? lastSeen { get; set; }
    }
}
