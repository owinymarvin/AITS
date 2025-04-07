# backend/users/serializers.py
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'faculty', 'is_verified']
        read_only_fields = ['is_verified']

class RegistrationSerializer(serializers.ModelSerializer):
    faculty_code = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone', 'role', 'faculty_code']
    
    def create(self, validated_data):
        faculty_code = validated_data.pop('faculty_code', None)
        
        # Handle faculty association if faculty_code provided
        if faculty_code:
            from api.models import Faculty
            try:
                faculty = Faculty.objects.get(code=faculty_code)
                validated_data['faculty'] = faculty
            except Faculty.DoesNotExist:
                pass
        
        # Create user without explicitly providing username
        user = User.objects.create_user(**validated_data)
        return user