using System;
using System.Collections.Generic;

namespace BE_Tutor.Models;

public partial class Application
{
    public string ApplicationId { get; set; } = null!;

    public string TutorId { get; set; } = null!;

    public string RequestId { get; set; } = null!;

    public string? Status { get; set; }

    public DateTime? AppliedAt { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string Specialization { get; set; } = null!;

    public string Qualification { get; set; } = null!;

    public string Experience { get; set; } = null!;

    public string TeachingArea { get; set; } = null!;

    public string TeachingFormat { get; set; } = null!;

    public bool Gender { get; set; }

    public virtual Request Request { get; set; } = null!;

    public virtual Tutor Tutor { get; set; } = null!;
}
