using System;
using System.Collections.Generic;

namespace FindTutor_MVC.Models;

public partial class Admin
{
    public int AdminId { get; set; }

    public string? UserId { get; set; }

    public string RoleId { get; set; } = null!;

    public virtual RoleLevel Role { get; set; } = null!;

    public virtual User? User { get; set; }
}
