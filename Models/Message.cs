using System;
using System.Collections.Generic;

namespace FindTutor_MVC.Models;

public partial class Message
{
    public string MessageId { get; set; } = null!;

    public string? SenderId { get; set; }

    public string? ReceiverId { get; set; }

    public string Content { get; set; } = null!;

    public DateTime? SentAt { get; set; }

    public virtual User? Receiver { get; set; }

    public virtual User? Sender { get; set; }
}
