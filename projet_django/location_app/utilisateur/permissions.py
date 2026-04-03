from rest_framework import permissions
from .models import RoleUtilisateur

class IsAdminUser(permissions.BasePermission):
    """Seuls les administrateurs ont accès."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == RoleUtilisateur.ADMIN)

class IsProprietaireUser(permissions.BasePermission):
    """Les propriétaires et les administrateurs ont l'accès."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and 
            request.user.role in [RoleUtilisateur.PROPRIETAIRE, RoleUtilisateur.ADMIN]
        )

class IsLocataireUser(permissions.BasePermission):
    """Les locataires et administrateurs ont l'accès."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and 
            request.user.role in [RoleUtilisateur.LOCATAIRE, RoleUtilisateur.ADMIN]
        )
