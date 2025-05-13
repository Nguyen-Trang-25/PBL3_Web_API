using System;
using System.Collections.Generic;

namespace FindTutor_MVC.Models;

public partial class Request
{
    public string RequestId { get; set; } = null!;

    public string StudentId { get; set; } = null!;

    public string? SubjectId { get; set; }

    public string Level { get; set; } = null!;

    public decimal? Fee { get; set; }

    public string Schedule { get; set; } = null!;

    public string? Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public string Location { get; set; } = null!;

    public bool GenderTutor { get; set; }

    public string Requirement { get; set; } = null!;

    public string LearningFormat { get; set; } = null!;

    public virtual ICollection<Application> Applications { get; set; } = new List<Application>();

    public virtual ICollection<Contract> Contracts { get; set; } = new List<Contract>();

    public virtual Student Student { get; set; } = null!;

    public virtual Subject? Subject { get; set; }
}
