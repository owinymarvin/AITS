# backend/api/serializers.py
from rest_framework import serializers
from users.models import User
from .models import Faculty, Department, Course, Issue

# Course related serializers
class CourseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField(max_length=255)

class StudentCourseSerializer(CourseSerializer):
    grade = serializers.CharField(max_length=10)

class LecturerCourseSerializer(CourseSerializer):
    students = serializers.IntegerField()

# Announcement serializer
class AnnouncementSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField(max_length=255)
    date = serializers.DateField()

# Deadline serializer
class DeadlineSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField(max_length=255)
    due_date = serializers.DateField()

# Class schedule serializer
class ClassScheduleSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    course = serializers.CharField(max_length=255)
    time = serializers.CharField(max_length=255)

# Grading item serializer
class PendingGradingSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField(max_length=255)
    submissions = serializers.IntegerField()
    course = serializers.CharField(max_length=255)

# Activity serializer
class ActivitySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    type = serializers.CharField(max_length=255)
    details = serializers.CharField(max_length=255)
    date = serializers.DateField()

# Dashboard serializers
class StudentDashboardSerializer(serializers.Serializer):
    courses = StudentCourseSerializer(many=True)
    announcements = AnnouncementSerializer(many=True)
    upcoming_deadlines = DeadlineSerializer(many=True)

class LecturerDashboardSerializer(serializers.Serializer):
    courses = LecturerCourseSerializer(many=True)
    upcoming_classes = ClassScheduleSerializer(many=True)
    pending_grading = PendingGradingSerializer(many=True)

class UserStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    students = serializers.IntegerField()
    lecturers = serializers.IntegerField()
    admins = serializers.IntegerField()

class CourseStatsSerializer(serializers.Serializer):
    active = serializers.IntegerField()
    archived = serializers.IntegerField()

class SystemHealthSerializer(serializers.Serializer):
    status = serializers.CharField()
    uptime = serializers.CharField()
    recent_issues = serializers.ListField(child=serializers.CharField(), required=False)

class AdminDashboardSerializer(serializers.Serializer):
    users = UserStatsSerializer()
    courses = CourseStatsSerializer()
    system_health = SystemHealthSerializer()
    recent_activities = ActivitySerializer(many=True)

class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = ['id', 'name', 'code', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
class DepartmentSerializer(serializers.ModelSerializer):
    faculty_name = serializers.CharField(source="faculty.name", read_only=True)  # Get faculty name

    class Meta:
        model = Department
        fields = ['id', 'department_name', 'department_code', 'details', 'faculty', 'faculty_name', 'created_at', 'updated_at']
        fields = '__all__' 

class CourseSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)  # Get department name
    department_code = serializers.CharField(source="department.department_code", read_only=True)  # Get department code

    class Meta:
        model = Course  # Correct the model
        fields = ['id', 'course_code', 'course_name', 'details', 'department', 'department_name', 'department_code', 'created_at', 'updated_at']

class IssueSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_code = serializers.SerializerMethodField()
    
    class Meta:
        model = Issue
        fields = [
            'id', 'title', 'issue_type', 'description', 'status', 
            'created_at', 'updated_at', 'student', 'student_name', 
            'course', 'course_code'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'student', 'student_name', 'course_code']
    
    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}".strip() or obj.student.username
    
    def get_course_code(self, obj):
        return obj.course.course_code

class IssueCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = ['course', 'issue_type', 'description', 'title']
    
    def create(self, validated_data):
        # Get the current user from the context
        user = self.context['request'].user
        
        # Add student and status to the validated data
        validated_data['student'] = user
        validated_data['status'] = 'Pending'
        
        # Create and return the issue
        return Issue.objects.create(**validated_data)
