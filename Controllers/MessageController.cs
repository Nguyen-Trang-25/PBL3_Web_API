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
            var conversations = await _context.Messages
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .Select(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
                .Distinct()
                .ToListAsync();

            // Nếu user chưa từng chat, nhưng có tin nhắn với chính mình
            if (!conversations.Contains(userId))
            {
                var hasSelfMessage = await _context.Messages.AnyAsync(m => m.SenderId == userId && m.ReceiverId == userId);
                if (hasSelfMessage)
                {
                    conversations.Add(userId);
                }
            }

            // Truy vấn thông tin người dùng từ danh sách cuộc hội thoại
            var users = await _context.Users
                .Where(u => conversations.Contains(u.UserId))
                .Select(u => new
                {
                    userId = u.UserId,
                    name = u.Name ?? "(Không có tên)",
                    role = u.Role ?? "student", // Mặc định student
                    avatarUrl = u.Role == "tutor"
                        ? "images/avatar/tutor_m.png"
                        : "images/avatar/student_boy.png"
                })
                .ToListAsync();

            return Ok(users);
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
