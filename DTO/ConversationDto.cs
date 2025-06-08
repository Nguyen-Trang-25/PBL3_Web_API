namespace BE_Tutor.DTO
{
    public class ConversationDto
    {
        public PartnerDto partner { get; set; }
        public string lastMessage { get; set; }
        public DateTime? lastTime { get; set; }
        public int unreadCount { get; set; }
    }
}
