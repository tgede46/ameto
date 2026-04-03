"""
Application : notification
Modèle : Notification
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError


# ─────────────────────────────────────────────
# ÉNUMÉRATIONS
# ─────────────────────────────────────────────

class TypeNotification(models.TextChoices):
    LOYER_IMPAYE = 'LOYER_IMPAYE', _('Loyer impayé')
    FIN_BAIL_PROCHE = 'FIN_BAIL_PROCHE', _('Fin de bail proche (3 mois)')
    REVISION_LOYER = 'REVISION_LOYER', _('Révision annuelle du loyer')
    QUITTANCE = 'QUITTANCE', _('Quittance disponible')
    DOCUMENT = 'DOCUMENT', _('Document généré (bail, état des lieux…)')


# ─────────────────────────────────────────────
# MODÈLE : Notification
# ─────────────────────────────────────────────

class Notification(models.Model):
    """
    Notification envoyée à un utilisateur (locataire ou propriétaire).
    Peut être générée automatiquement (signal) ou manuellement.
    """

    titre = models.CharField(
        max_length=200,
        verbose_name=_('Titre'),
        help_text=_('Titre de la notification'),
        default='Notification',
    )
    message = models.TextField(
        verbose_name=_('Message'),
        help_text=_('Contenu de la notification'),
    )
    date_envoi = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Date d'envoi"),
    )
    lu = models.BooleanField(
        default=False,
        verbose_name=_('Lu'),
    )
    type = models.CharField(
        max_length=30,
        choices=TypeNotification.choices,
        verbose_name=_('Type de notification'),
    )

    # ─── Relation ───
    destinataire = models.ForeignKey(
        'utilisateur.Utilisateur',
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('Destinataire'),
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Créé le'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Modifié le'))

    class Meta:
        verbose_name = _('Notification')
        verbose_name_plural = _('Notifications')
        ordering = ['-date_envoi']

    def __str__(self):
        statut_lu = 'Lu' if self.lu else 'Non lu'
        return (
            f"[{self.get_type_display()}] → {self.destinataire} "
            f"({statut_lu}) — {self.date_envoi.strftime('%d/%m/%Y %H:%M')}"
        )

    # ─── Méthodes métier ───

    def envoyer(self):
        """
        Envoie la notification via email, SMS et notification push.
        (Implémentation à compléter selon les services tiers.)
        """
        # TODO: implémenter l'envoi email (Django email backend)
        # TODO: implémenter l'envoi SMS (ex : API Africa's Talking, Orange API)
        # TODO: implémenter les notifications push (ex : Firebase FCM)
        raise NotImplementedError(
            "L'envoi de notification doit être implémenté."
        )

    def marquer_comme_lu(self):
        """Marque la notification comme lue."""
        self.lu = True
        self.save(update_fields=['lu', 'updated_at'])


class Message(models.Model):
    """Message direct entre un propriétaire et un locataire."""

    expediteur = models.ForeignKey(
        'utilisateur.Utilisateur',
        on_delete=models.CASCADE,
        related_name='messages_envoyes',
        verbose_name=_('Expéditeur'),
    )
    destinataire = models.ForeignKey(
        'utilisateur.Utilisateur',
        on_delete=models.CASCADE,
        related_name='messages_recus',
        verbose_name=_('Destinataire'),
    )
    contenu = models.TextField(
        verbose_name=_('Contenu'),
        help_text=_('Texte du message'),
    )
    lu = models.BooleanField(
        default=False,
        verbose_name=_('Lu'),
    )
    date_lecture = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Date de lecture'),
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Créé le'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Modifié le'))

    class Meta:
        verbose_name = _('Message')
        verbose_name_plural = _('Messages')
        ordering = ['-created_at']

    def __str__(self):
        return (
            f"{self.expediteur.prenom} -> {self.destinataire.prenom} "
            f"({self.created_at.strftime('%d/%m/%Y %H:%M')})"
        )

    def clean(self):
        from utilisateur.models import RoleUtilisateur

        if self.expediteur_id == self.destinataire_id:
            raise ValidationError(_('Vous ne pouvez pas vous envoyer un message.'))

        roles = {self.expediteur.role, self.destinataire.role}
        roles_attendus = {RoleUtilisateur.PROPRIETAIRE, RoleUtilisateur.LOCATAIRE}
        if roles != roles_attendus:
            raise ValidationError(
                _('La messagerie est autorisée uniquement entre propriétaire et locataire.')
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def marquer_comme_lu(self):
        from django.utils import timezone

        self.lu = True
        self.date_lecture = timezone.now()
        self.save(update_fields=['lu', 'date_lecture', 'updated_at'])
