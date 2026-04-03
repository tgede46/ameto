"""
Signals Django pour l'application biens.
Déclencheurs :
  - post_save sur Bail  → met à jour bien.statut (LOUE / VACANT)
  - post_save sur Bail  → crée une Notification de fin de bail proche
  - post_save sur Paiement → crée automatiquement une Quittance si VALIDE
  - post_save sur Paiement → crée une Notification QUITTANCE
"""

from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender='biens.Bail')
def bail_post_save(sender, instance, created, **kwargs):
    """
    Signal déclenché après chaque sauvegarde d'un Bail.
    - Création d'un bail EN_COURS → bien.statut = LOUE
    - Résiliation d'un bail (RESILE) → bien.statut = VACANT
    """
    from biens.models import StatusBail, StatusBien

    bien = instance.bien

    if instance.statut == StatusBail.EN_COURS:
        if bien.statut != StatusBien.LOUE:
            bien.statut = StatusBien.LOUE
            bien.save(update_fields=['statut', 'updated_at'])

    elif instance.statut == StatusBail.RESILE:
        if bien.statut != StatusBien.VACANT:
            bien.statut = StatusBien.VACANT
            bien.save(update_fields=['statut', 'updated_at'])


@receiver(post_save, sender='biens.Paiement')
def paiement_post_save(sender, instance, created, **kwargs):
    """
    Signal déclenché après chaque sauvegarde d'un Paiement.
    - Si statut = VALIDE → crée automatiquement une Quittance et envoie une Notification.
    """
    from biens.models import Quittance, StatusPaiement
    from notification.models import Notification, TypeNotification

    if instance.statut == StatusPaiement.VALIDE:
        # 1. Créer la quittance si elle n'existe pas encore
        quittance, created_q = Quittance.objects.get_or_create(
            paiement=instance,
            defaults={'montant_total': instance.montant},
        )

        # 2. Envoyer une notification au locataire
        Notification.objects.create(
            destinataire=instance.locataire,
            type=TypeNotification.QUITTANCE,
            message=(
                f"Votre paiement de {instance.montant} CFA (réf. {instance.reference}) "
                f"a été validé. Votre quittance est disponible."
            ),
        )
