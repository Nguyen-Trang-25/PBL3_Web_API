using System;
using System.Collections.Generic;

namespace FindTutor_MVC.Models;

public partial class RoleLevel
{
    public string RoleId { get; set; } = null!;

    public string RoleName { get; set; } = null!;

    public virtual ICollection<Admin> Admins { get; set; } = new List<Admin>();
}
