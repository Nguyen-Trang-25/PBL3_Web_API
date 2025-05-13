using System;
using System.Collections.Generic;

namespace FindTutor_MVC.Models;

public partial class Payment
{
    public string PaymentId { get; set; } = null!;

    public string ContractId { get; set; } = null!;

    public decimal Amount { get; set; }

    public DateOnly PaymentDate { get; set; }

    public string? Status { get; set; }

    public virtual Contract Contract { get; set; } = null!;

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
