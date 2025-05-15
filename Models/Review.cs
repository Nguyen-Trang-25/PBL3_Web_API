using System;
using System.Collections.Generic;

namespace BE_Tutor.Models;

public partial class Review
{
    public string ReviewId { get; set; } = null!;

    public string? StudentId { get; set; }

    public string? TutorId { get; set; }

    public int? Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Student? Student { get; set; }

    public virtual Tutor? Tutor { get; set; }
}
