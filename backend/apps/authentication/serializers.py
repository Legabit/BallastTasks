from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from rest_framework import exceptions, serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Allow authenticating with either username or email."""

    def validate(self, attrs):
        username_or_email = attrs.get(self.username_field)
        if username_or_email:
            user = User.objects.filter(
                Q(username__iexact=username_or_email) | Q(email__iexact=username_or_email)
            ).first()
            if user is not None:
                attrs[self.username_field] = user.get_username()

        try:
            return super().validate(attrs)
        except exceptions.AuthenticationFailed:
            raise exceptions.AuthenticationFailed(
                "Invalid username/email or password. Please check your credentials and try again."
            )


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "date_joined")
        read_only_fields = ("id", "date_joined")


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def validate_username(self, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise serializers.ValidationError("Username cannot be empty.")
        if User.objects.filter(username__iexact=trimmed).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return trimmed

    def validate_email(self, value: str) -> str:
        normalized_email = value.strip().lower()
        if not normalized_email:
            raise serializers.ValidationError("Email cannot be empty.")
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return normalized_email

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def create(self, validated_data: dict) -> User:
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
