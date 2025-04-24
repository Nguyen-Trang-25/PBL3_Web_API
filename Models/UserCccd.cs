using System;
using System.Collections.Generic;

namespace FindTutor_MVC.Models;

public partial class UserCccd
{
    public string Id { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string CccdNumber { get; set; } = null!;

    public DateOnly CccdIssuedDate { get; set; }

    public string CccdPlaceOfIssue { get; set; } = null!;

    public bool? CccdVerified { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
