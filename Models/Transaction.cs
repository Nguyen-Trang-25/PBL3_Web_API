using System;
using System.Collections.Generic;

namespace BE_Tutor.Models;

public partial class Transaction
{
    public string TransactionId { get; set; } = null!;

    public string PaymentId { get; set; } = null!;

    public string Action { get; set; } = null!;

    public DateTime Timestamp { get; set; }

    public virtual Payment Payment { get; set; } = null!;
}
