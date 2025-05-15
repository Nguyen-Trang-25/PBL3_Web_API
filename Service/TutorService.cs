using BE_Tutor.DTO;
using BE_Tutor.Repository;

namespace BE_Tutor.Service
{
    public class TutorService : ITutorService
    {
        private readonly ITutorRepository _tutorRepository;

        public TutorService(ITutorRepository tutorRepository)
        {
            _tutorRepository = tutorRepository;
        }

        public async Task<List<TutorResponse>> SearchTutorsAsync(string subject, float? ratingMin, int? experienceMin)
        {
            var tutors = await _tutorRepository.GetTutorsAsync(subject, ratingMin, experienceMin);

            return tutors.Select(t => new TutorResponse
            {
                TutorId = t.TutorId,
                Name = t.User.Name,
                //Specialty = t.Specialty,
                Rating = t.Rating,
                TotalReviews = t.TotalReviews,
                Experience = t.Experience
            }).ToList();
        }

        public async Task<TutorResponse> GetTutorByIdAsync(string tutorId)
        {
            var tutor = await _tutorRepository.GetTutorByIdAsync(tutorId);

            if (tutor == null)
                return null;

            return new TutorResponse
            {
                TutorId = tutor.TutorId,
                Name = tutor.User.Name,
                //Specialty = tutor.Specialty,
                Rating = tutor.Rating,
                TotalReviews = tutor.TotalReviews,
                Experience = tutor.Experience
            };
        }
    }

}
