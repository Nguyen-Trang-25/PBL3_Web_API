using System;
using System.Collections.Generic;

namespace FindTutor_MVC.Models;

public partial class User
{
    public string UserId { get; set; } = null!;

    public string? Name { get; set; }

    public string? Email { get; set; }

    public string Phone { get; set; }

    public string Password { get; set; } = null!;

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string? Role { get; set; }

    public bool? Gender { get; set; }

    public virtual ICollection<Message> MessageReceivers { get; set; } = new List<Message>();

    public virtual ICollection<Message> MessageSenders { get; set; } = new List<Message>();

    public virtual ICollection<Student> Students { get; set; } = new List<Student>();

    public virtual ICollection<Tutor> Tutors { get; set; } = new List<Tutor>();

    public virtual ICollection<UserCccd> UserCccds { get; set; } = new List<UserCccd>();

    public virtual ICollection<Verification> Verifications { get; set; } = new List<Verification>();
}
