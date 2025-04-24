using System;
using System.Collections.Generic;

namespace FindTutor_MVC.Models;

public partial class Payment
{
    public string PaymentId { get; set; } = null!;

    public string? ContractId { get; set; }

    public decimal Amount { get; set; }

    public DateOnly PaymentDate { get; set; }

    public string? Status { get; set; }

    public virtual Contract? Contract { get; set; }

    public virtual ICollection<TransactionHistory> TransactionHistories { get; set; } = new List<TransactionHistory>();
}
