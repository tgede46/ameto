from django.contrib.auth.models import BaseUserManager
from django.utils.translation import gettext_lazy as _

class UtilisateurManager(BaseUserManager):
    """
    Gestionnaire personnalisé pour Utilisateur (sans username, email comme identifiant).
    """

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_("L'email doit être renseigné."))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        # Le superuser est lié au rôle ADMIN
        from .models import RoleUtilisateur
        extra_fields.setdefault('role', RoleUtilisateur.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser doit avoir is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser doit avoir is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)
