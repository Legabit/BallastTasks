from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "priority", "creator", "assignee", "due_date", "created_at")
    list_filter = ("status", "priority", "created_at", "due_date")
    search_fields = ("title", "description", "creator__username", "assignee__username")
    readonly_fields = ("created_at", "updated_at")
