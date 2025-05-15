﻿using System;
using System.Collections.Generic;

namespace BE_Tutor.Models;

public partial class Student
{
    public string StudentId { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string? GradeLevel { get; set; }

    public virtual ICollection<Request> Requests { get; set; } = new List<Request>();

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual User User { get; set; } = null!;
}
