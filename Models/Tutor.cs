using System;
using System.Collections.Generic;

namespace FindTutor_MVC.Models;

public partial class Tutor
{
    public string TutorId { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string? Experience { get; set; }

    public double? Rating { get; set; }

    public int? TotalReviews { get; set; }

    public int? SpecialtySubjectId { get; set; }

    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();

    public virtual ICollection<Contract> Contracts { get; set; } = new List<Contract>();

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual User User { get; set; } = null!;
}
