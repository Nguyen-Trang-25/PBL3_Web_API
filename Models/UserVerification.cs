using System;
using System.Collections.Generic;

namespace FindTutor_MVC.Models;

public partial class UserVerification
{
    public string VerificationId { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string VerificationCode { get; set; } = null!;

    public DateTime ExpiresAt { get; set; }

    public virtual User User { get; set; } = null!;
}
