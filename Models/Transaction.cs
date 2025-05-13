using System;
using System.Collections.Generic;

namespace FindTutor_MVC.Models;

public partial class Transaction
{
    public string TransactionId { get; set; } = null!;

    public string PaymentId { get; set; } = null!;

    public string Action { get; set; } = null!;

    public DateTime Timestamp { get; set; }

    public virtual Payment Payment { get; set; } = null!;
}
