using BE_Tutor.Models;

namespace BE_Tutor.Repository
{
    public interface ITutorRepository
    {
        Task<List<Tutor>> GetTutorsAsync(string subject, float? ratingMin, int? experienceMin);
        Task<Tutor> GetTutorByIdAsync(string tutorId);
    }
}
