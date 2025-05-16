using BE_Tutor.DTO;
using BE_Tutor.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace BE_Tutor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        
            private readonly ApplicationDbContext _context;
            public ProfileController(ApplicationDbContext context)
            {
                _context = context;
            }

            [HttpGet("GetAllUsers")]
            [Authorize(Roles = "Admin")]
            public async Task<IActionResult> GetAllUsers()
            {
                var tutors = await _context.Users
                    .Where(u => u.Role == "tutor")
                    .Select(u => new
                    {
                        u.Name,
                        u.Gender,
                        u.Phone,
                        u.Email,
                        u.Status,
                        u.CreatedAt
                    })
                    .ToListAsync();

                var students = await _context.Users
                    .Where(u => u.Role == "student")
                    .Select(u => new
                    {
                        u.Name,
                        u.Gender,
                        u.Phone,
                        u.Email,
                        u.Status,
                        u.CreatedAt
                    })
                    .ToListAsync();


                return Ok(new// trả về anonymous object
                {
                    Tutors = tutors,
                    Students = students
                });

            }

            [HttpDelete("Delete/{id}")]
            [Authorize(Roles = "Admin")]
            public async Task<IActionResult> DeleteUser(string id)
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null) return NotFound(new { message = "Người dùng không tồn tại." });

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Xóa người dùng thành công." });
            }

            // ng dung xem pro5 cua minh
            [HttpGet("GetMyUser")]
            public async Task<IActionResult> GetProfile()
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var user = await _context.Users
                    .Where(u => u.UserId == userId)
                    .Select(u => new
                    {
                        u.Name,
                        u.Gender,
                        u.Phone,
                        u.Email,
                        u.Status,
                        u.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                    return NotFound(new { message = "Không tìm thấy người dùng." });
                return Ok(user);
            }

            [HttpPut("UpdateMyUser")]
            public async Task<IActionResult> UpdateMyProfile([FromBody] ViewProfileDto dto)
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

                if (user == null)
                    return NotFound(new { message = "Không tìm thấy người dùng." });

                user.Name = dto.Name;
                user.Gender = dto.Gender;
                user.Email = dto.Email;
                user.Workplace = dto.Workplace;
                user.Age = dto.Age;

                _context.Users.Update(user);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Cập nhật thông tin thành công." });
            }
            
        }
    }



