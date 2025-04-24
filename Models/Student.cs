using System;
using System.Collections.Generic;

namespace FindTutor_MVC.Models;

public partial class Student
{
    public string StudentId { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string? StudentCode { get; set; }

    public virtual ICollection<Contract> Contracts { get; set; } = new List<Contract>();

    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    public virtual ICollection<Request> Requests { get; set; } = new List<Request>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual User User { get; set; } = null!;
}
