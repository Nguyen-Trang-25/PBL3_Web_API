using System;
using System.Collections.Generic;

namespace BE_Tutor.Models;

public partial class Message
{
    public string MessageId { get; set; } = null!;

    public string SenderId { get; set; } = null!;

    public string ReceiverId { get; set; } = null!;

    public string Content { get; set; } = null!;

    public DateTime SentAt { get; set; }

    public virtual User Receiver { get; set; } = null!;

    public virtual User Sender { get; set; } = null!;
}
