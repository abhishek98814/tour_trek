from rest_framework import permissions
# from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, 'role', None) == 'admin'

def _is_admin(user):
    return bool(user and user.is_authenticated and (user.is_staff or getattr(user, 'role', '') == 'admin'))


# class IsAdminRole(permissions.BasePermission):
#     def has_permission(self, request, view):
#         return _is_admin(request.user)


class IsSellerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and (_is_admin(u) or getattr(u, 'role', '') in ('seller', 'agency')))