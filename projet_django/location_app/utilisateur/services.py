"""
Service — application utilisateur
Logique métier découplée des views.
"""

from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Utilisateur, Proprietaire, Locataire


class UtilisateurService:
    """Opérations sur les utilisateurs (authentification, profil)."""

    @staticmethod
    def creer_proprietaire(donnees: dict) -> Proprietaire:
        """Crée un propriétaire depuis les données validées du serializer."""
        password = donnees.pop('password', None)
        proprietaire = Proprietaire(**donnees)
        if password:
            proprietaire.set_password(password)
        proprietaire.save()
        return proprietaire

    @staticmethod
    def creer_locataire(donnees: dict) -> Locataire:
        """Crée un locataire depuis les données validées du serializer."""
        password = donnees.pop('password', None)
        locataire = Locataire(**donnees)
        if password:
            locataire.set_password(password)
        locataire.save()
        return locataire

    @staticmethod
    def authentifier(email: str, password: str) -> Utilisateur | None:
        """Authentifie un utilisateur par email/mot de passe."""
        return authenticate(username=email, password=password)

    @staticmethod
    def get_tokens(user: Utilisateur) -> dict:
        """Génère les tokens JWT (access + refresh) pour un utilisateur."""
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': user.role,
            'nom': f"{user.prenom} {user.nom}",
        }

    @staticmethod
    def changer_mot_de_passe(user: Utilisateur, ancien: str, nouveau: str) -> bool:
        """Change le mot de passe si l'ancien est correct. Retourne True si succès."""
        if not check_password(ancien, user.password):
            return False
        user.set_password(nouveau)
        user.save(update_fields=['password', 'updated_at'])
        return True

    @staticmethod
    def desactiver_compte(user_id: int) -> bool:
        """Désactive un compte utilisateur."""
        updated = Utilisateur.objects.filter(pk=user_id).update(actif=False)
        return updated > 0
