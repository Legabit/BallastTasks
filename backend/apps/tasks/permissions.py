from rest_framework import permissions


class IsTaskParticipantOrCreator(permissions.BasePermission):
    """
    Object-level permission allowing:
    - Admin/staff: Full access.
    - Creator: Full read/write/delete access.
    - Assignee: Read access and status/progress update access (no deletion or reassignment).
    - Others: No access.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_staff or user.is_superuser:
            return True

        is_creator = obj.creator_id == user.id
        is_assignee = obj.assignee_id == user.id

        # Read operations allowed for creator or assignee
        if request.method in permissions.SAFE_METHODS:
            return is_creator or is_assignee

        # Update operations
        if request.method in ("PUT", "PATCH"):
            if is_creator:
                return True
            if is_assignee:
                # Assignee cannot change assignee (reassign)
                requested_assignee = request.data.get("assignee", ...)
                if requested_assignee is not ...:
                    new_assignee_id = (
                        requested_assignee.id
                        if hasattr(requested_assignee, "id")
                        else requested_assignee
                    )
                    if new_assignee_id != obj.assignee_id:
                        return False
                return True
            return False

        # Deletion restricted to creator or admin
        if request.method == "DELETE":
            return is_creator

        return False
