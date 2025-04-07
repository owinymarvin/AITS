# backend/api/views.py
from rest_framework import status, permissions, viewsets
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Faculty, Department, Course, Issue
from .serializers import FacultySerializer, DepartmentSerializer, CourseSerializer, IssueSerializer, IssueCreateSerializer
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.decorators import action

class FacultyListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        faculties = Faculty.objects.all()
        serializer = FacultySerializer(faculties, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = FacultySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class FacultyCreateView(APIView):
    # authentication_classes = [JWTAuthentication]  # If using JWT
    permission_classes = [IsAdminUser]  # Requires admin user
    
    def post(self, request):
        serializer = FacultySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class DepartmentListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        departments = Department.objects.all()
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DepartmentCreateView(APIView):
    permission_classes = [IsAdminUser]  # Requires admin user
    
    def post(self, request):
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
class CourseListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        courses = Course.objects.all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IsOwnerOrStaff(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or staff to access it.
    """
    def has_object_permission(self, request, view, obj):
        # Staff can access any object
        if request.user.is_staff:
            return True
        
        # Check if the object has a student attribute and it matches the request user
        return hasattr(obj, 'student') and obj.student == request.user

class IssueCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = IssueCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IssueViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing issues.
    """
    serializer_class = IssueSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrStaff]
    
    def get_queryset(self):
        """
        This view should return a list of all issues for the currently authenticated user,
        or all issues for staff users.
        """
        user = self.request.user
        if user.is_staff:
            return Issue.objects.all()
        return Issue.objects.filter(student=user)
    
    def get_serializer_class(self):
        """
        Use different serializers for creation vs retrieval.
        """
        if self.action == 'create':
            return IssueCreateSerializer
        return IssueSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return the complete issue object using the standard serializer
        issue = serializer.instance
        response_serializer = IssueSerializer(issue)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Special endpoint for admins to update just the status.
        """
        if not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        issue = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Issue.STATUS_CHOICES):
            return Response(
                {"detail": f"Invalid status. Must be one of {dict(Issue.STATUS_CHOICES).keys()}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        issue.status = new_status
        issue.save()
        serializer = self.get_serializer(issue)
        return Response(serializer.data)


# class StudentDashboardView(APIView):
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get(self, request):
#         if not request.user.is_student():
#             return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        
#         # Mock data for student dashboard
#         data = {
#             "courses": [
#                 {"id": 1, "title": "Introduction to Programming", "grade": "A-"},
#                 {"id": 2, "title": "Data Structures", "grade": "B+"},
#                 {"id": 3, "title": "Algorithms", "grade": "In Progress"}
#             ],
#             "announcements": [
#                 {"id": 1, "title": "Exam Schedule Posted", "date": "2025-03-05"},
#                 {"id": 2, "title": "Lab Submission Deadline Extended", "date": "2025-03-08"}
#             ],
#             "upcoming_deadlines": [
#                 {"id": 1, "title": "Programming Assignment 3", "due_date": "2025-03-15"},
#                 {"id": 2, "title": "Group Project Proposal", "due_date": "2025-03-20"}
#             ]
#         }
#         return Response(data)

# class LecturerDashboardView(APIView):
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get(self, request):
#         if not request.user.is_lecturer():
#             return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        
#         # Mock data for lecturer dashboard
#         data = {
#             "courses": [
#                 {"id": 1, "title": "Introduction to Programming", "students": 45},
#                 {"id": 2, "title": "Advanced Web Development", "students": 30}
#             ],
#             "upcoming_classes": [
#                 {"id": 1, "course": "Introduction to Programming", "time": "Monday, 10:00 AM"},
#                 {"id": 2, "course": "Advanced Web Development", "time": "Wednesday, 2:00 PM"}
#             ],
#             "pending_grading": [
#                 {"id": 1, "title": "Assignment 2", "submissions": 42, "course": "Introduction to Programming"},
#                 {"id": 2, "title": "Midterm Exam", "submissions": 28, "course": "Advanced Web Development"}
#             ]
#         }
#         return Response(data)

# class AdminDashboardView(APIView):
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get(self, request):
#         if not request.user.is_admin():
#             return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        
#         # Mock data for admin dashboard
#         data = {
#             "users": {
#                 "total": 540,
#                 "students": 500,
#                 "lecturers": 35,
#                 "admins": 5
#             },
#             "courses": {
#                 "active": 42,
#                 "archived": 15
#             },
#             "system_health": {
#                 "status": "Good",
#                 "uptime": "99.8%",
#                 "recent_issues": []
#             },
#             "recent_activities": [
#                 {"id": 1, "type": "User Registration", "details": "5 new users registered", "date": "2025-03-08"},
#                 {"id": 2, "type": "Course Created", "details": "New course: Machine Learning", "date": "2025-03-07"},
#                 {"id": 3, "type": "Grade Update", "details": "Introduction to Programming grades posted", "date": "2025-03-06"}
#             ]
#         }
#         return Response(data)
