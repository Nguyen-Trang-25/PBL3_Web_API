using System;
using System.Collections.Generic;

namespace FindTutor_MVC.Models;

public partial class Contract
{
    public string ContractId { get; set; } = null!;

    public string? TutorId { get; set; }

    public string? StudentId { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual Student? Student { get; set; }

    public virtual Tutor? Tutor { get; set; }
}
