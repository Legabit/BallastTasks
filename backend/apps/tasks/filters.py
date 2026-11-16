import django_filters

from .models import Task, TaskPriority, TaskStatus


class TaskFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=TaskStatus.choices)
    priority = django_filters.ChoiceFilter(choices=TaskPriority.choices)
    due_date_after = django_filters.IsoDateTimeFilter(field_name="due_date", lookup_expr="gte")
    due_date_before = django_filters.IsoDateTimeFilter(field_name="due_date", lookup_expr="lte")
    assigned_to_me = django_filters.BooleanFilter(method="filter_assigned_to_me")
    created_by_me = django_filters.BooleanFilter(method="filter_created_by_me")

    class Meta:
        model = Task
        fields = ["status", "priority", "due_date_after", "due_date_before", "assignee", "creator"]

    def __init__(self, data=None, *args, **kwargs):
        if data is not None:
            data = data.copy()
            for key in ("due_date_after", "due_date_before"):
                val = data.get(key)
                if val and isinstance(val, str) and " " in val:
                    parts = val.rsplit(" ", 1)
                    if len(parts) == 2 and (":" in parts[1] or parts[1].isdigit()):
                        data[key] = f"{parts[0]}+{parts[1]}"
        super().__init__(data=data, *args, **kwargs)

    def filter_assigned_to_me(self, queryset, name, value):
        user = self.request.user
        if value is True and user.is_authenticated:
            return queryset.filter(assignee=user)
        if value is False and user.is_authenticated:
            return queryset.exclude(assignee=user)
        return queryset

    def filter_created_by_me(self, queryset, name, value):
        user = self.request.user
        if value is True and user.is_authenticated:
            return queryset.filter(creator=user)
        if value is False and user.is_authenticated:
            return queryset.exclude(creator=user)
        return queryset
