using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace FindTutor_MVC.Models;

public partial class ApplicationDbContext : DbContext
{
    public ApplicationDbContext()
    {
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Admin> Admins { get; set; }

    public virtual DbSet<Application> Applications { get; set; }

    public virtual DbSet<Contract> Contracts { get; set; }

    public virtual DbSet<Course> Courses { get; set; }

    public virtual DbSet<Enrollment> Enrollments { get; set; }

    public virtual DbSet<Message> Messages { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Request> Requests { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<RoleLevel> RoleLevels { get; set; }

    public virtual DbSet<Schedule> Schedules { get; set; }

    public virtual DbSet<Student> Students { get; set; }

    public virtual DbSet<Subject> Subjects { get; set; }

    public virtual DbSet<TransactionHistory> TransactionHistories { get; set; }

    public virtual DbSet<Tutor> Tutors { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserCccd> UserCccds { get; set; }

    public virtual DbSet<UserVerification> UserVerifications { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=localhost;Database=pbl3;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Admin>(entity =>
        {
            entity.HasKey(e => e.AdminId).HasName("PK__Admins__43AA4141CB65744C");

            entity.HasIndex(e => e.UserId, "UQ__Admins__B9BE370E07D001CE").IsUnique();

            entity.Property(e => e.AdminId).HasColumnName("admin_id");
            entity.Property(e => e.RoleId)
                .HasMaxLength(3)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("role_id");
            entity.Property(e => e.UserId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("user_id");

            entity.HasOne(d => d.Role).WithMany(p => p.Admins)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Admins_RoleLevels");

            entity.HasOne(d => d.User).WithOne(p => p.Admin)
                .HasForeignKey<Admin>(d => d.UserId)
                .HasConstraintName("FK_Admins_Users");
        });

        modelBuilder.Entity<Application>(entity =>
        {
            entity.HasKey(e => e.ApplicationId).HasName("PK__applicat__79FDB1CFAF359DF3");

            entity.ToTable("applications");

            entity.Property(e => e.ApplicationId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("applicationId");
            entity.Property(e => e.AppliedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("applied_at");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.Experience)
                .HasColumnType("ntext")
                .HasColumnName("experience");
            entity.Property(e => e.FullName)
                .HasMaxLength(255)
                .HasColumnName("full_name");
            entity.Property(e => e.Gender).HasColumnName("gender");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("phone");
            entity.Property(e => e.Qualification)
                .HasMaxLength(255)
                .HasColumnName("qualification");
            entity.Property(e => e.RequestId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("request_id");
            entity.Property(e => e.Specialization)
                .HasMaxLength(255)
                .HasColumnName("specialization");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("pending");
            entity.Property(e => e.TeachingArea)
                .HasMaxLength(255)
                .HasColumnName("teaching_area");
            entity.Property(e => e.TeachingFormat)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("teaching_format");
            entity.Property(e => e.TutorId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("tutor_id");

            entity.HasOne(d => d.Request).WithMany(p => p.Applications)
                .HasForeignKey(d => d.RequestId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__applicati__reque__536D5C82");

            entity.HasOne(d => d.Tutor).WithMany(p => p.Applications)
                .HasForeignKey(d => d.TutorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__applicati__tutor__52793849");
        });

        modelBuilder.Entity<Contract>(entity =>
        {
            entity.HasKey(e => e.ContractId).HasName("PK__Contract__F8D66423C7AE96C1");

            entity.Property(e => e.ContractId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("contract_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.StartDate).HasColumnName("start_date");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("active")
                .HasColumnName("status");
            entity.Property(e => e.StudentId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("student_id");
            entity.Property(e => e.TutorId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("tutor_id");

            entity.HasOne(d => d.Student).WithMany(p => p.Contracts)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("FK_Contracts_Students");

            entity.HasOne(d => d.Tutor).WithMany(p => p.Contracts)
                .HasForeignKey(d => d.TutorId)
                .HasConstraintName("FK_Contracts_Tutors");
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.CourseId).HasName("PK__Courses__8F1EF7AE3A98A9D5");

            entity.Property(e => e.CourseId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("course_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Fee)
                .HasColumnType("decimal(18, 0)")
                .HasColumnName("fee");
            entity.Property(e => e.Level)
                .HasMaxLength(50)
                .HasColumnName("level");
            entity.Property(e => e.Location)
                .HasMaxLength(250)
                .HasColumnName("location");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("open")
                .HasColumnName("status");
            entity.Property(e => e.SubjectId)
                .HasMaxLength(3)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("subject_id");
            entity.Property(e => e.TutorId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("tutor_id");

            entity.HasOne(d => d.Subject).WithMany(p => p.Courses)
                .HasForeignKey(d => d.SubjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Courses_Subjects");

            entity.HasOne(d => d.Tutor).WithMany(p => p.Courses)
                .HasForeignKey(d => d.TutorId)
                .HasConstraintName("FK__Courses__tutor_i__5535A963");
        });

        modelBuilder.Entity<Enrollment>(entity =>
        {
            entity.HasKey(e => e.EnrollmentId).HasName("PK__Enrollme__6D24AA7A4446C470");

            entity.Property(e => e.EnrollmentId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("enrollment_id");
            entity.Property(e => e.CourseId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("course_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("active")
                .HasColumnName("status");
            entity.Property(e => e.StudentId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("student_id");

            entity.HasOne(d => d.Course).WithMany(p => p.Enrollments)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK_Enrollments_Courses");

            entity.HasOne(d => d.Student).WithMany(p => p.Enrollments)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("FK_Enrollments_Students");
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.MessageId).HasName("PK__Messages__0BBF6EE65A5C07ED");

            entity.Property(e => e.MessageId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("message_id");
            entity.Property(e => e.Content)
                .HasColumnType("text")
                .HasColumnName("content");
            entity.Property(e => e.ReceiverId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("receiver_id");
            entity.Property(e => e.SenderId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("sender_id");
            entity.Property(e => e.SentAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("sent_at");

            entity.HasOne(d => d.Receiver).WithMany(p => p.MessageReceivers)
                .HasForeignKey(d => d.ReceiverId)
                .HasConstraintName("FK_Messages_Receiver");

            entity.HasOne(d => d.Sender).WithMany(p => p.MessageSenders)
                .HasForeignKey(d => d.SenderId)
                .HasConstraintName("FK_Messages_Sender");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payments__ED1FC9EA60738E16");

            entity.Property(e => e.PaymentId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("payment_id");
            entity.Property(e => e.Amount)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("amount");
            entity.Property(e => e.ContractId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("contract_id");
            entity.Property(e => e.PaymentDate).HasColumnName("payment_date");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("pending")
                .HasColumnName("status");

            entity.HasOne(d => d.Contract).WithMany(p => p.Payments)
                .HasForeignKey(d => d.ContractId)
                .HasConstraintName("FK_Payments_Contracts");
        });

        modelBuilder.Entity<Request>(entity =>
        {
            entity.HasKey(e => e.RequestId).HasName("PK__Requests__18D3B90F708FFAD5");

            entity.Property(e => e.RequestId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("request_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Fee)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("fee");
            entity.Property(e => e.GenderTutor).HasColumnName("gender_tutor");
            entity.Property(e => e.LearningFormat)
                .HasMaxLength(10)
                .IsFixedLength()
                .HasColumnName("learning_format");
            entity.Property(e => e.Level)
                .HasMaxLength(50)
                .HasColumnName("level");
            entity.Property(e => e.Location)
                .HasMaxLength(250)
                .HasColumnName("location");
            entity.Property(e => e.Requirement)
                .HasMaxLength(250)
                .HasColumnName("requirement");
            entity.Property(e => e.Schedule)
                .HasColumnType("text")
                .HasColumnName("schedule");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("pending")
                .HasColumnName("status");
            entity.Property(e => e.StudentId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("student_id");
            entity.Property(e => e.Subjectid)
                .HasMaxLength(3)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("subjectid");

            entity.HasOne(d => d.Student).WithMany(p => p.Requests)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("FK__Requests__studen__4F7CD00D");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.ReviewId).HasName("PK__Reviews__60883D90C407565F");

            entity.Property(e => e.ReviewId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("review_id");
            entity.Property(e => e.Comment)
                .HasColumnType("text")
                .HasColumnName("comment");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Rating).HasColumnName("rating");
            entity.Property(e => e.StudentId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("student_id");
            entity.Property(e => e.TutorId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("tutor_id");

            entity.HasOne(d => d.Student).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("FK_Reviews_Students");

            entity.HasOne(d => d.Tutor).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.TutorId)
                .HasConstraintName("FK_Reviews_Tutors");
        });

        modelBuilder.Entity<RoleLevel>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__RoleLeve__760965CC55FF2BF6");

            entity.HasIndex(e => e.RoleName, "UQ__RoleLeve__783254B1EC455CA6").IsUnique();

            entity.Property(e => e.RoleId)
                .HasMaxLength(3)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("role_id");
            entity.Property(e => e.RoleName)
                .HasMaxLength(50)
                .HasColumnName("role_name");
        });

        modelBuilder.Entity<Schedule>(entity =>
        {
            entity.HasKey(e => e.ScheduleId).HasName("PK__Schedule__C46A8A6F4E8D0D83");

            entity.Property(e => e.ScheduleId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("schedule_id");
            entity.Property(e => e.CourseId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("course_id");
            entity.Property(e => e.Date).HasColumnName("date");
            entity.Property(e => e.EndTime).HasColumnName("end_time");
            entity.Property(e => e.StartTime).HasColumnName("start_time");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("pending")
                .HasColumnName("status");

            entity.HasOne(d => d.Course).WithMany(p => p.Schedules)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK__Schedules__cours__59FA5E80");
        });

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.StudentId).HasName("PK__Students__2A33069A53AB0DF0");

            entity.HasIndex(e => e.StudentCode, "UQ__Students__6DF33C455DF3F271").IsUnique();

            entity.HasIndex(e => e.UserId, "UQ__Students__B9BE370E9D99CF42").IsUnique();

            entity.Property(e => e.StudentId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("student_id");
            entity.Property(e => e.StudentCode)
                .HasMaxLength(20)
                .HasColumnName("student_code");
            entity.Property(e => e.UserId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("user_id");

            entity.HasOne(d => d.User).WithOne(p => p.Student)
                .HasForeignKey<Student>(d => d.UserId)
                .HasConstraintName("FK__Students__user_i__49C3F6B7");
        });

        modelBuilder.Entity<Subject>(entity =>
        {
            entity.HasKey(e => e.SubjectId).HasName("PK__Subjects__5004F6605DE26335");

            entity.HasIndex(e => e.Name, "UQ__Subjects__72E12F1BB249D797").IsUnique();

            entity.Property(e => e.SubjectId)
                .HasMaxLength(3)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("subject_id");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasColumnName("description");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
        });

        modelBuilder.Entity<TransactionHistory>(entity =>
        {
            entity.HasKey(e => e.TransactionId).HasName("PK__Transact__85C600AF8B0CE5EC");

            entity.ToTable("TransactionHistory");

            entity.Property(e => e.TransactionId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("transaction_id");
            entity.Property(e => e.Action)
                .HasMaxLength(50)
                .HasColumnName("action");
            entity.Property(e => e.PaymentId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("payment_id");
            entity.Property(e => e.Timestamp)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("timestamp");

            entity.HasOne(d => d.Payment).WithMany(p => p.TransactionHistories)
                .HasForeignKey(d => d.PaymentId)
                .HasConstraintName("FK_TransactionHistory_Payments");
        });

        modelBuilder.Entity<Tutor>(entity =>
        {
            entity.HasKey(e => e.TutorId).HasName("PK__Tutors__50DE5D01932534CD");

            entity.HasIndex(e => e.UserId, "UQ__Tutors__B9BE370E6475FEDA").IsUnique();

            entity.Property(e => e.TutorId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("tutor_id");
            entity.Property(e => e.Experience)
                .HasColumnType("ntext")
                .HasColumnName("experience");
            entity.Property(e => e.Rating)
                .HasDefaultValue(0.0)
                .HasColumnName("rating");
            entity.Property(e => e.SpecialtySubjectId).HasColumnName("specialty_subject_id");
            entity.Property(e => e.TotalReviews)
                .HasDefaultValue(0)
                .HasColumnName("total_reviews");
            entity.Property(e => e.UserId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("user_id");

            entity.HasOne(d => d.User).WithOne(p => p.Tutor)
                .HasForeignKey<Tutor>(d => d.UserId)
                .HasConstraintName("FK__Tutors__user_id__44FF419A");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__B9BE370F275358A6");

            entity.HasIndex(e => e.Email, "UQ__Users__AB6E61649ED720B0").IsUnique();

            entity.HasIndex(e => e.Phone, "UQ__Users__B43B145F04E88052").IsUnique();

            entity.Property(e => e.UserId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("user_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.Gender).HasColumnName("gender");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .HasColumnName("password");
            entity.Property(e => e.Phone)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("phone");
            entity.Property(e => e.Role)
                .HasMaxLength(10)
                .HasColumnName("role");
            entity.Property(e => e.Status)
                .HasMaxLength(25)
                .HasDefaultValue("active")
                .HasColumnName("status");
        });

        modelBuilder.Entity<UserCccd>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__UserCCCD__3213E83FC79B5AB8");

            entity.ToTable("UserCCCD");

            entity.HasIndex(e => e.CccdNumber, "UQ__UserCCCD__3719081014C99201").IsUnique();

            entity.Property(e => e.Id)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("id");
            entity.Property(e => e.CccdIssuedDate).HasColumnName("cccd_issued_date");
            entity.Property(e => e.CccdNumber)
                .HasMaxLength(12)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("cccd_number");
            entity.Property(e => e.CccdPlaceOfIssue)
                .HasMaxLength(255)
                .HasColumnName("cccd_place_of_issue");
            entity.Property(e => e.CccdVerified)
                .HasDefaultValue(false)
                .HasColumnName("cccd_verified");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.UserId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.UserCccds)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UserCCCD__user_i__3E1D39E1");
        });

        modelBuilder.Entity<UserVerification>(entity =>
        {
            entity.HasKey(e => e.VerificationId).HasName("PK__UserVeri__24F179697A884E3E");

            entity.ToTable("UserVerification");

            entity.Property(e => e.VerificationId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("verification_id");
            entity.Property(e => e.ExpiresAt)
                .HasColumnType("datetime")
                .HasColumnName("expires_at");
            entity.Property(e => e.UserId)
                .HasMaxLength(10)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("user_id");
            entity.Property(e => e.VerificationCode)
                .HasMaxLength(10)
                .HasColumnName("verification_code");

            entity.HasOne(d => d.User).WithMany(p => p.UserVerifications)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__UserVerif__user___3F466844");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
