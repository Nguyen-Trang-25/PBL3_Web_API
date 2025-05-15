using BE_Tutor.DTO;

namespace BE_Tutor.Service
{
    public interface ITutorService
    {
        Task<List<TutorResponse>> SearchTutorsAsync(string subject, float? ratingMin, int? experienceMin);
        Task<TutorResponse> GetTutorByIdAsync(string tutorId);
    }

}
