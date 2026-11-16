"""
URL configuration for Task Management System.
"""

from django.contrib import admin
from django.urls import include, path, re_path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

from .views import health_check

schema_view = get_schema_view(
    openapi.Info(
        title="Task Management System API",
        default_version="v1",
        description="RESTful API documentation for Task Management System",
        contact=openapi.Contact(email="contact@example.com"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path("admin/", admin.site.urls),
    # Authentication endpoints
    path("api/auth/", include("apps.authentication.urls")),
    # Tasks CRUD API
    path("api/", include("apps.tasks.urls")),
    # System health check
    path("api/health/", health_check, name="health-check"),
    path("health/", health_check, name="root-health-check"),
    # API Documentation
    re_path(
        r"^swagger(?P<format>\.json|\.yaml)$",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path(
        "redoc/",
        schema_view.with_ui("redoc", cache_timeout=0),
        name="schema-redoc",
    ),
]
