# backend/api/models.py
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings

class Faculty(models.Model):
    name = models.CharField(
        _("Faculty Name"),
        max_length=100,
        unique=True,
        help_text="Official name of the faculty"
    )
    code = models.CharField(
        _("Faculty Code"),
        max_length=10,
        unique=True,
        help_text="Short unique code for the faculty (e.g., SCI for Science)"
    )
    description = models.TextField(
        _("Description"),
        blank=True,
        null=True,
        help_text="Detailed description of the faculty"
    )
    
    created_at = models.DateTimeField(
        _("Created At"),
        auto_now_add=True,
        help_text="Timestamp of creation"
    )
    updated_at = models.DateTimeField(
        _("Updated At"),
        auto_now=True,
        help_text="Timestamp of last update"
    )

    class Meta:
        verbose_name = _("Faculty")
        verbose_name_plural = _("Faculties")
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(
                fields=['name', 'code'],
                name='unique_faculty_identifier'
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"
    
class Department(models.Model):
    department_name = models.CharField(
        _("Department Name"),
        max_length=100,
        unique=True,
        help_text="Official name of the department"
    )
    department_code = models.CharField(
        _("Department Code"),
        max_length=10,
        unique=True,
        help_text="Short unique code for the department (e.g., DCS for Computer Science)"
    )
    details = models.TextField(
        _("Details"),
        blank=True,
        null=True,
        help_text="Detailed description of the department"
    )
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    created_at = models.DateTimeField(
        _("Created At"),
        auto_now_add=True,
        help_text="Timestamp of creation"
    )
    updated_at = models.DateTimeField(
        _("Updated At"),
        auto_now=True,
        help_text="Timestamp of last update"
    )

    class Meta:
        verbose_name = _("Department")
        verbose_name_plural = _("Departments")
        ordering = ['department_name']
        constraints = [
            models.UniqueConstraint(
                fields=['department_name'],
                name='unique_department_identifier'
            )
        ]

    def __str__(self):
        return f"{self.department_name}"
    
class Course(models.Model):
    course_name = models.CharField(
        _("Course Name"),
        max_length=100,
        unique=True,
        help_text="Official name of the course"
    )
    course_code = models.CharField(
        _("Course Code"),
        max_length=10,
        unique=True,
        help_text="Short unique code for the course (e.g., CS101 for Introduction to Computer Science)"
    )
    details = models.TextField(
        _("Details"),
        blank=True,
        null=True,
        help_text="Detailed description of the course"
    )
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    created_at = models.DateTimeField(
        _("Created At"),
        auto_now_add=True,
        help_text="Timestamp of creation"
    )
    updated_at = models.DateTimeField(
        _("Updated At"),
        auto_now=True,
        help_text="Timestamp of last update"
    )

    class Meta:
        verbose_name = _("Course")
        verbose_name_plural = _("Courses")
        ordering = ['course_name']
        constraints = [
            models.UniqueConstraint(
                fields=['course_name', 'course_code'],
                name='unique_course_identifier'
            )
        ]
    def __str__(self):
        return f"{self.course_name} ({self.course_code})"
    
class College(models.Model):
    COLLEGE_CHOICES = [
        ('COCIS', 'College of Computing and Information Sciences'),
        ('CEDAT', 'College of Engineering, Design, Art and Technology'),
        ('LAW', 'School of Law'),
        ('CAES', 'College of Agricultural and Environmental Sciences'),
        ('CHUSS', 'College of Humanities and Social Sciences'),
        ('CONAS', 'College of Natural Sciences'),
        ('EDUC', 'School of Education'),
        ('CHS', 'College of Health Sciences'),
        ('COVAB', 'College of Veterinary Medicine, Animal Resources and Bio-security'),
        ('COBAMS', 'College of Business and Management Sciences'),
    ]
    
    code = models.CharField(max_length=10, unique=True, choices=COLLEGE_CHOICES)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    established_date = models.DateField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    class Meta:
        verbose_name = "College"
        verbose_name_plural = _("Colleges")
        ordering = ['code']

class Issue(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('InProgress', 'In Progress'),
        ('Solved', 'Solved'),
    ]
    
    ISSUE_TYPE_CHOICES = [
        ('Missing Marks', 'Missing Marks'),
        ('Appeals', 'Appeals'),
        ('Corrections', 'Corrections'),
    ]
    
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='issues')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='issues')
    issue_type = models.CharField(max_length=50, choices=ISSUE_TYPE_CHOICES)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=200)  # Added to match your React component
    
    def __str__(self):
        return f"{self.id} - {self.title} ({self.status})"
    
    class Meta:
        ordering = ['-created_at']
