# backend/users/serializers.py
from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'college', 'is_verified']
        read_only_fields = ['is_verified']

class RegistrationSerializer(serializers.ModelSerializer):
    college_code = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone', 'role', 'college_code']
    
    def create(self, validated_data):
        college_code = validated_data.pop('college_code', None)
        
        # Handle college association if college_code provided
        if college_code:
            from api.models import College
            try:
                college = College.objects.get(code=college_code)
                validated_data['college'] = college
            except College.DoesNotExist:
                pass
        
        # Create user without explicitly providing username
        user = User.objects.create_user(**validated_data)
        return user