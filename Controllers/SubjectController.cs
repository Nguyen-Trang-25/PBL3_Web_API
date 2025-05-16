using BE_Tutor.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BE_Tutor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubjectController : ControllerBase
    {
        private readonly ApplicationDbContext _context;// khai báo đối tượng

        public SubjectController(ApplicationDbContext context)
        {
            _context = context;
        }


        [HttpGet("subjects")]
        public async Task<IActionResult> GetSubjects()
        {
            var subjects = await _context.Subjects
                .Select(s => new { s.SubjectId, s.Name })
                .ToListAsync();

            return Ok(subjects);
        }

    }
}
