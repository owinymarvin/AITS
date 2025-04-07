# backend/api/urls.py
from django.urls import path
from .views import (
    # StudentDashboardView, 
    # LecturerDashboardView, 
    # AdminDashboardView,
    FacultyListView,
    FacultyCreateView,
    DepartmentCreateView,
    DepartmentListView,
    CourseListView,
    IssueViewSet,
    IssueCreateView,
)

urlpatterns = [
    # path('dashboard/student/', StudentDashboardView.as_view(), name='student_dashboard'),
    # path('dashboard/lecturer/', LecturerDashboardView.as_view(), name='lecturer_dashboard'),
    # path('dashboard/admin/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('faculty/', FacultyListView.as_view(), name='faculty_list'),  
    path('department/', DepartmentListView.as_view(), name='department-list'),
    path('course/', CourseListView.as_view(), name='course-list'),
    path('issue/', IssueViewSet.as_view({'get': 'list', 'post': 'create'}), name='issue-list'), 
    path('admin/api/issue/add/', IssueCreateView.as_view(), name='issue-add'),
    # path('admin/api/department/add/', DepartmentCreateView.as_view(), name='department-add'),
]