using System;
using System.Collections.Generic;

namespace FindTutor_MVC.Models;

public partial class User
{
    public string UserId { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Phone { get; set; }

    public string Password { get; set; } = null!;

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string? Role { get; set; }

    public bool? Gender { get; set; }

    public virtual Admin? Admin { get; set; }

    public virtual ICollection<Message> MessageReceivers { get; set; } = new List<Message>();

    public virtual ICollection<Message> MessageSenders { get; set; } = new List<Message>();

    public virtual Student? Student { get; set; }

    public virtual Tutor? Tutor { get; set; }

    public virtual ICollection<UserCccd> UserCccds { get; set; } = new List<UserCccd>();

    public virtual ICollection<UserVerification> UserVerifications { get; set; } = new List<UserVerification>();
}
