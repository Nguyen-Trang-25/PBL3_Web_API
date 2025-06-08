using BE_Tutor.DTO;
using BE_Tutor.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BE_Tutor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessageController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Inject DbContext qua constructor
        public MessageController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("conversations/{userId}")]
        public async Task<IActionResult> GetUserConversations(string userId)
        {
            // Lấy danh sách partner đã chat cùng userId
            var partnerIds = await _context.Messages
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .Select(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
                .Distinct()
                .ToListAsync();

            // Nếu chưa có partner nhưng user chat với chính mình
            if (!partnerIds.Contains(userId))
            {
                var hasSelfMessage = await _context.Messages.AnyAsync(m => m.SenderId == userId && m.ReceiverId == userId);
                if (hasSelfMessage)
                {
                    partnerIds.Add(userId);
                }
            }

            // Lấy thông tin partner (user khác)
            var partners = await _context.Users
                .Where(u => partnerIds.Contains(u.UserId))
                .Select(u => new PartnerDto
                {
                    Id = u.UserId,
                    Name = u.Name ?? "(Không có tên)",
                    Role = u.Role ?? "student",
                    AvatarUrl = u.Role == "tutor"
                        ? "images/avatar/tutor_m.png"
                        : "images/avatar/student_boy.png",
                    Status = "offline",
                    lastSeen = null
                })
                .ToListAsync();


            // Với mỗi partner, lấy tin nhắn cuối và số tin nhắn chưa đọc của userId
            var conversations = new List<ConversationDto>();

            foreach (var partner in partners)
            {
                var lastMessage = await _context.Messages
                    .Where(m =>
                        (m.SenderId == userId && m.ReceiverId == partner.Id) ||
                        (m.SenderId == partner.Id && m.ReceiverId == userId))
                    .OrderByDescending(m => m.SentAt)
                    .FirstOrDefaultAsync();

                var unreadCount = await _context.Messages
                    .Where(m => m.SenderId == partner.Id && m.ReceiverId == userId)
                    .CountAsync();

                conversations.Add(new ConversationDto
                {
                    partner = new PartnerDto
                    {
                        Id = partner.Id,
                        Name = partner.Name,
                        Role = partner.Role,
                        AvatarUrl = partner.AvatarUrl,
                        Status = "offline",
                        lastSeen = null
                    },
                    lastMessage = lastMessage?.Content ?? "",
                    lastTime = lastMessage?.SentAt,
                    unreadCount = unreadCount
                });
            }

            var sorted = conversations
                .OrderByDescending(c => c.lastTime ?? DateTime.MinValue)
                .ToList();



            return Ok(sorted);
        
    }




        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] MessageViewModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Lấy message mới nhất dựa theo MessageId (giả sử là số chuỗi dạng 10 chữ số)
            var latestMessage = await _context.Messages
                .OrderByDescending(m => m.MessageId)
                .FirstOrDefaultAsync();

            string newId = "0000000001"; // ID mặc định nếu chưa có bản ghi nào
            if (latestMessage != null)
            {
                long latestNumber = long.Parse(latestMessage.MessageId);
                newId = (latestNumber + 1).ToString("D10"); // format thành chuỗi 10 chữ số
            }

            var message = new Message
            {
                MessageId = newId,
                SenderId = model.SenderId,
                ReceiverId = model.ReceiverId,
                Content = model.Content,
                SentAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(message);
        }


        [HttpGet("history/{userId1}/{userId2}")]
        public async Task<IActionResult> GetMessageHistory(string userId1, string userId2)
        {
            var messages = await _context.Messages
                .Where(m => (m.SenderId == userId1 && m.ReceiverId == userId2)
                         || (m.SenderId == userId2 && m.ReceiverId == userId1))
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            return Ok(messages);
        }

    }


}
