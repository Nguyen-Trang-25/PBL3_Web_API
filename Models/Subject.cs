using System;
using System.Collections.Generic;

namespace FindTutor_MVC.Models;

public partial class Subject
{
    public string SubjectId { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();
}
