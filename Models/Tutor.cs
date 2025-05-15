using System;
using System.Collections.Generic;

namespace BE_Tutor.Models;

public partial class Tutor
{
    public string TutorId { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string? Experience { get; set; }

    public double? Rating { get; set; }

    public int? TotalReviews { get; set; }

    public string? SpecialtySubjectId { get; set; }

    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual Subject? SpecialtySubject { get; set; }

    public virtual User User { get; set; } = null!;
}
