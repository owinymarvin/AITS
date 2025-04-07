# backend/api/admin.py
from django.contrib import admin
from .models import Faculty, Department, Course, College, Issue

@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    # Existing Faculty admin code remains unchanged
    list_display = ('name', 'code', 'created_at', 'updated_at')
    search_fields = ('name', 'code', 'description')
    list_filter = ('created_at', 'updated_at')
    ordering = ('name',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'description'),
            'description': "Core faculty information"
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
            'description': "Automatically managed timestamps"
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('name', 'code', 'description'),
        }),
    )

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['name'].help_text = "Official full name of the faculty (e.g., 'Faculty of Science')"
        form.base_fields['code'].help_text = "Unique faculty code (e.g., 'SCI' for Science)"
        form.base_fields['description'].widget.attrs['rows'] = 4
        return form

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('department_name', 'department_code', 'faculty', 'created_at', 'updated_at')
    search_fields = ('department_name', 'department_code', 'details')
    list_filter = ('faculty', 'created_at', 'updated_at')
    ordering = ('department_name',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('department_name', 'department_code', 'faculty', 'details'),
            'description': "Core department information"
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
            'description': "Automatically managed timestamps"
        }),
    )

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "faculty":
            kwargs["queryset"] = Faculty.objects.order_by('name')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('course_name', 'course_code', 'get_department_name', 'get_faculty_name', 'created_at', 'updated_at')
    search_fields = ('course_name', 'course_code', 'details')
    list_filter = ('department__faculty', 'department', 'created_at', 'updated_at')
    ordering = ('course_name',)
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Basic Information', {
            'fields': ('course_name', 'course_code', 'department', 'details'),
            'description': "Core course information"
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
            'description': "Automatically managed timestamps"
        }),
    )

    def get_department_name(self, obj):
        return obj.department.department_name if obj.department else "N/A"
    
    get_department_name.admin_order_field = "department__department_name"  # Enables sorting
    get_department_name.short_description = "Department"  # Label in the admin panel

    def get_faculty_name(self, obj):
        return obj.department.faculty.name if obj.department and obj.department.faculty else "N/A"
    
    get_faculty_name.admin_order_field = "department__faculty__name"
    get_faculty_name.short_description = "Faculty"

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "department":
            kwargs["queryset"] = Department.objects.order_by('department_name')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    
    
admin.site.register(College)
class CollegeAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'description', 'established_date')
    search_fields = ('name', 'code', 'description')
    list_filter = ('established_date')
    ordering = ('code',)
    readonly_fields = ('established_date')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'description'),
            'description': "Core college information"
        }),
        ('Timestamps', {
            'fields': ('established_date',),
            'classes': ('collapse',),
            'description': "Automatically managed timestamps"
        }),
    )
    def form_field_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "college":
            kwargs["queryset"] = College.objects.order_by('name')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
        
@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'student', 'course', 'issue_type', 'status', 'created_at')
    list_filter = ('status', 'issue_type', 'course')
    search_fields = ('title', 'description', 'student__username', 'course__course_code')
    date_hierarchy = 'created_at'
