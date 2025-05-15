using System;
using System.Collections.Generic;

namespace BE_Tutor.Models;

public partial class Contract
{
    public string ContractId { get; set; } = null!;

    public string RequestId { get; set; } = null!;

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public decimal Fee { get; set; }

    public string Schedule { get; set; } = null!;

    public string Location { get; set; } = null!;

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual Request Request { get; set; } = null!;
}
