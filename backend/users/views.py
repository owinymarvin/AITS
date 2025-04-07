# backend/users/views.py
from rest_framework import status, generics
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import NotFound

from .models import User
from .serializers import UserSerializer, RegistrationSerializer

class UserInfoView(RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        if not user.is_authenticated or user.is_anonymous:
            raise NotFound("User not found.")
        return user

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.all()

class RegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        
        try:
            if serializer.is_valid(raise_exception=True):
                user = serializer.save()
                
                # Set user as verified immediately
                user.is_verified = True
                user.save()
                
                # Generate tokens for immediate login
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'message': 'User registered successfully',
                    'email': user.email,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }, status=status.HTTP_201_CREATED)
        
        except serializers.ValidationError:
            return Response({
                'error': 'Registration failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)