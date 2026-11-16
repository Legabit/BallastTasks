from django.urls import path

from .views import CustomTokenRefreshView, LoginView, MeView, RegisterView, UserListView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("token/refresh/", CustomTokenRefreshView.as_view(), name="auth-token-refresh"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("users/", UserListView.as_view(), name="auth-users"),
]
