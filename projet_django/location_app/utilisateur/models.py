"""
Application : utilisateur
Modèles : Utilisateur (AbstractUser), Admin, Proprietaire, Locataire
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from .managers import UtilisateurManager
from django.utils import timezone


# ─────────────────────────────────────────────
# ÉNUMÉRATIONS
# ─────────────────────────────────────────────

class RoleUtilisateur(models.TextChoices):
    ADMIN = 'ADMIN', _('Administrateur')
    PROPRIETAIRE = 'PROPRIETAIRE', _('Propriétaire')
    LOCATAIRE = 'LOCATAIRE', _('Locataire')


class MethodeAuth2FA(models.TextChoices):
    TOTP = 'TOTP', _('Google Authenticator (TOTP)')
    EMAIL = 'EMAIL', _('Code par email')


# ─────────────────────────────────────────────
# MODÈLE DE BASE : Utilisateur
# ─────────────────────────────────────────────

class Utilisateur(AbstractUser):
    """
    Modèle utilisateur personnalisé.
    Remplace le modèle User par défaut de Django.
    Configuré via AUTH_USER_MODEL = 'utilisateur.Utilisateur' dans settings.py
    """

    # On désactive username car on utilise email comme identifiant
    username = None

    nom = models.CharField(
        max_length=150,
        verbose_name=_('Nom de famille'),
    )
    prenom = models.CharField(
        max_length=150,
        verbose_name=_('Prénom'),
    )
    telephone = models.CharField(
        max_length=20,
        unique=True,
        verbose_name=_('Numéro de téléphone'),
    )
    email = models.EmailField(
        unique=True,
        verbose_name=_('Adresse email'),
    )
    adresse = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_('Adresse postale'),
    )
    actif = models.BooleanField(
        default=True,
        verbose_name=_('Compte actif'),
    )
    role = models.CharField(
        max_length=20,
        choices=RoleUtilisateur.choices,
        default=RoleUtilisateur.LOCATAIRE,
        verbose_name=_('Rôle'),
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Créé le'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Modifié le'))

    objects = UtilisateurManager()

    # On utilise l'email comme champ d'authentification
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom', 'telephone']

    class Meta:
        verbose_name = _('Utilisateur')
        verbose_name_plural = _('Utilisateurs')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.get_role_display()})"

    @property
    def full_name(self):
        return f"{self.prenom} {self.nom}"

    @property
    def first_name(self):
        return self.prenom

    @first_name.setter
    def first_name(self, value):
        self.prenom = value

    # ─── Méthodes métier ───

    def connexion(self):
        """Active le compte et marque l'utilisateur comme connecté."""
        self.actif = True
        self.save(update_fields=['actif', 'updated_at'])

    def deconnexion(self):
        """Méthode de déconnexion logique (la session est gérée par Django)."""
        pass  # Géré par django.contrib.auth

    def creation(self):
        """Méthode utilitaire de création (wrapper sur save)."""
        self.save()


# ─────────────────────────────────────────────
# MODÈLE : Admin
# ─────────────────────────────────────────────

class Admin(Utilisateur):
    """
    Administrateur du système.
    Accès complet à tous les biens, locataires, baux et paiements.
    Héritage multi-tables Django depuis Utilisateur.
    """

    class Meta:
        verbose_name = _('Administrateur')
        verbose_name_plural = _('Administrateurs')

    def __str__(self):
        return f"Admin : {self.prenom} {self.nom}"

    def save(self, *args, **kwargs):
        self.role = RoleUtilisateur.ADMIN
        super().save(*args, **kwargs)


# ─────────────────────────────────────────────
# MODÈLE : Proprietaire
# ─────────────────────────────────────────────

class Proprietaire(Utilisateur):
    """
    Propriétaire de biens immobiliers.
    Héritage multi-tables Django depuis Utilisateur.
    Relation OneToMany vers Bien (définie dans l'app 'biens').
    """

    nobre_logement = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Nombre de logements'),
        help_text=_('Peut être calculé dynamiquement à partir des biens associés'),
    )

    class Meta:
        verbose_name = _('Propriétaire')
        verbose_name_plural = _('Propriétaires')

    def __str__(self):
        return f"Propriétaire : {self.prenom} {self.nom}"

    def save(self, *args, **kwargs):
        self.role = RoleUtilisateur.PROPRIETAIRE
        super().save(*args, **kwargs)

    def get_nombre_biens(self):
        """Calcule dynamiquement le nombre de biens possédés."""
        return self.biens.count()


# ─────────────────────────────────────────────
# MODÈLE : Locataire
# ─────────────────────────────────────────────

class Locataire(Utilisateur):
    """
    Locataire d'un bien immobilier.
    Héritage multi-tables Django depuis Utilisateur.
    Relations : baux (OneToMany vers Bail) et paiements (OneToMany vers Paiement)
    — ces relations sont définies dans l'app 'biens' et 'comptabilite'.
    """

    date_naissance = models.DateField(
        null=True,
        blank=True,
        verbose_name=_('Date de naissance'),
    )
    profession = models.CharField(
        max_length=150,
        blank=True,
        verbose_name=_('Profession'),
    )
    personne_a_prevenir = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_('Personne à prévenir (garant)'),
        help_text=_('Nom et contact du garant ou de la personne à prévenir'),
    )

    # Nouveaux champs pour le dossier de candidature
    nationalite = models.CharField(
        max_length=100,
        default='Togolaise',
        verbose_name=_('Nationalité'),
    )
    revenus = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Revenus mensuels'),
    )
    cni = models.ImageField(
        upload_to='locataires/cni/',
        null=True,
        blank=True,
        verbose_name=_('Pièce d\'identité'),
    )
    fiche_paie = models.FileField(
        upload_to='locataires/fiches_paie/',
        null=True,
        blank=True,
        verbose_name=_('Fiches de paie'),
    )

    # Informations détaillées du garant (optionnel)
    garant_nom = models.CharField(max_length=255, blank=True, verbose_name=_('Nom du garant'))
    garant_lien = models.CharField(max_length=100, blank=True, verbose_name=_('Lien avec le garant'))
    garant_telephone = models.CharField(max_length=20, blank=True, verbose_name=_('Téléphone du garant'))
    garant_email = models.EmailField(blank=True, verbose_name=_('Email du garant'))
    garant_profession = models.CharField(max_length=150, blank=True, verbose_name=_('Profession du garant'))
    garant_revenus = models.PositiveIntegerField(default=0, verbose_name=_('Revenus du garant'))

    is_verified = models.BooleanField(
        default=False,
        verbose_name=_('Profil vérifié'),
        help_text=_('Indique si les documents ont été validés par l\'administration'),
    )
    trust_score = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Score de confiance'),
    )



    class Meta:
        verbose_name = _('Locataire')
        verbose_name_plural = _('Locataires')

    def __str__(self):
        return f"Locataire : {self.prenom} {self.nom}"

    def save(self, *args, **kwargs):
        self.role = RoleUtilisateur.LOCATAIRE
        super().save(*args, **kwargs)

    @property
    def bail_actif(self):
        """Retourne le premier bail actif du locataire."""
        return self.bails.filter(statut='EN_COURS').select_related('bien').first()

    @property
    def garant(self):

        """Retourne les infos du garant sous forme de dictionnaire."""
        return {
            'nom': self.garant_nom,
            'lien': self.garant_lien,
            'telephone': self.garant_telephone,
            'email': self.garant_email,
            'profession': self.garant_profession,
            'revenus': self.garant_revenus,
        }



# ─────────────────────────────────────────────
# MODÈLE : TwoFactorAuth
# ─────────────────────────────────────────────

class TwoFactorAuth(models.Model):
    """
    Configuration de l'authentification à deux facteurs pour un utilisateur.
    Supporte TOTP (Google Authenticator) et codes par email.
    """

    utilisateur = models.OneToOneField(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='two_factor_auth',
        verbose_name=_('Utilisateur'),
    )

    # Configuration TOTP (Google Authenticator)
    totp_secret = models.CharField(
        max_length=32,
        blank=True,
        verbose_name=_('Secret TOTP'),
        help_text=_('Secret pour Google Authenticator'),
    )

    # Codes de secours (backup codes)
    backup_codes = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_('Codes de secours'),
        help_text=_('Liste de codes de secours à usage unique'),
    )

    # Code email temporaire
    email_code = models.CharField(
        max_length=6,
        blank=True,
        verbose_name=_('Code email'),
        help_text=_('Code de vérification envoyé par email'),
    )

    email_code_created_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Date de création du code email'),
    )

    # Configuration
    methode = models.CharField(
        max_length=10,
        choices=MethodeAuth2FA.choices,
        default=MethodeAuth2FA.TOTP,
        verbose_name=_('Méthode 2FA'),
    )

    is_enabled = models.BooleanField(
        default=False,
        verbose_name=_('2FA activé'),
    )

    verified_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Dernière vérification'),
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Créé le'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Modifié le'))

    class Meta:
        verbose_name = _('Authentification à deux facteurs')
        verbose_name_plural = _('Authentifications à deux facteurs')
        ordering = ['-created_at']

    def __str__(self):
        return f"2FA - {self.utilisateur.email} ({self.get_methode_display()})"

    def is_email_code_valid(self, code: str) -> bool:
        """Vérifie si le code email est valide et non expiré."""
        from .two_factor import TwoFactorAuthService

        if not self.email_code or not self.email_code_created_at:
            return False

        if TwoFactorAuthService.is_code_expired(self.email_code_created_at):
            return False

        return self.email_code == code

    def verify_totp(self, code: str) -> bool:
        """Vérifie un code TOTP."""
        from .two_factor import TwoFactorAuthService

        if not self.totp_secret:
            return False

        return TwoFactorAuthService.verify_totp_code(self.totp_secret, code)

    def verify_backup_code(self, code: str) -> bool:
        """Vérifie et consomme un code de secours."""
        if code in self.backup_codes:
            self.backup_codes.remove(code)
            self.save(update_fields=['backup_codes', 'updated_at'])
            return True
        return False

    def mark_verified(self):
        """Marque la 2FA comme vérifiée maintenant."""
        self.verified_at = timezone.now()
        self.save(update_fields=['verified_at', 'updated_at'])
