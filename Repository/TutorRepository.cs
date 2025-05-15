using Microsoft.EntityFrameworkCore;
//using BE_Tutor.Data;
using BE_Tutor.Models;

namespace BE_Tutor.Repository
{
    public class TutorRepository : ITutorRepository
    {
        private readonly ApplicationDbContext _context;

        public TutorRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Tutor>> GetTutorsAsync(string subject, float? ratingMin, int? experienceMin)
        {
            var query = _context.Tutors.Include(t => t.User).AsQueryable();  // Bao gồm thông tin User

            if (!string.IsNullOrEmpty(subject))
            {
                //query = query.Where(t => t.Specialty.Contains(subject));
            }

            if (ratingMin.HasValue)
            {
                query = query.Where(t => t.Rating >= ratingMin.Value);
            }

            if (experienceMin.HasValue)
            {
                query = query.Where(t => t.Experience.Length >= experienceMin.Value);  // Assuming experience is stored as a string
            }

            return await query.ToListAsync();
        }

        public async Task<Tutor> GetTutorByIdAsync(string tutorId)
        {
            return await _context.Tutors.Include(t => t.User).FirstOrDefaultAsync(t => t.TutorId == tutorId);  // Bao gồm thông tin User khi tìm theo TutorId
        }
    }
}
