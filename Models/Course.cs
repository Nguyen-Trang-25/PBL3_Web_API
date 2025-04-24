using System;
using System.Collections.Generic;

namespace FindTutor_MVC.Models;

public partial class Course
{
    public string CourseId { get; set; } = null!;

    public string SubjectId { get; set; } = null!;

    public string TutorId { get; set; } = null!;

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public decimal Fee { get; set; }

    public string? Location { get; set; }

    public string? Level { get; set; }

    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    public virtual ICollection<Schedule> Schedules { get; set; } = new List<Schedule>();

    public virtual Subject Subject { get; set; } = null!;

    public virtual Tutor Tutor { get; set; } = null!;
}
