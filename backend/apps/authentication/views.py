from django.contrib.auth import get_user_model
from drf_yasg.utils import swagger_auto_schema
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import UserRegistrationSerializer, UserSerializer
from .throttles import AuthAnonRateThrottle

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Register a new user account with strict password validation."""

    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthAnonRateThrottle]

    @swagger_auto_schema(
        operation_description="Register a new user account",
        responses={201: UserSerializer(), 400: "Validation Error"},
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user_serializer = UserSerializer(user, context=self.get_serializer_context())
        return Response(user_serializer.data, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """Obtain JWT access and refresh token pair."""

    throttle_classes = [AuthAnonRateThrottle]


class CustomTokenRefreshView(TokenRefreshView):
    """Refresh JWT access token and receive a rotated refresh token."""


class MeView(generics.RetrieveAPIView):
    """Retrieve details for the currently authenticated user."""

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Get profile information for the authenticated user",
        responses={200: UserSerializer(), 401: "Unauthorized"},
    )
    def get_object(self):
        return self.request.user
