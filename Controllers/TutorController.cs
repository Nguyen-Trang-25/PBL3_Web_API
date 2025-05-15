using BE_Tutor.Service;
using Microsoft.AspNetCore.Mvc;

namespace BE_Tutor.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class TutorsController : ControllerBase
    {
        private readonly ITutorService _tutorService;

        public TutorsController(ITutorService tutorService)
        {
            _tutorService = tutorService;
        }

        [HttpGet]
        public async Task<IActionResult> GetTutors([FromQuery] string? subject, [FromQuery] float? ratingMin, [FromQuery] int? experienceMin)
        {
            var tutors = await _tutorService.SearchTutorsAsync(subject, ratingMin, experienceMin);
            return Ok(tutors);
        }

        [HttpGet("{tutorId}")]
        public async Task<IActionResult> GetTutorById(string tutorId)
        {
            var tutor = await _tutorService.GetTutorByIdAsync(tutorId);
            if (tutor == null)
                return NotFound();
            return Ok(tutor);
        }
    }

}
