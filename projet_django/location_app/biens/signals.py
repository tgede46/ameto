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
    - Si c'est le paiement de caution (premier paiement), active le bail.
    """
    from biens.models import Quittance, StatusPaiement, StatusBail
    from notification.models import Notification, TypeNotification

    if instance.statut == StatusPaiement.VALIDE:
        # 1. Créer la quittance si elle n'existe pas encore
        quittance, created = Quittance.objects.get_or_create(
            paiement=instance,
            defaults={'montant_total': instance.montant},
        )
        
        # 2. Générer le PDF si nécessaire
        if created or not quittance.fichier_pdf:
            from biens.services import QuittanceService
            QuittanceService.generer_pdf(quittance)

        # 2. Envoyer une notification au locataire
        Notification.objects.create(
            destinataire=instance.locataire,
            type=TypeNotification.QUITTANCE,
            message=(
                f"Votre paiement de {instance.montant} CFA (réf. {instance.reference}) "
                f"a été validé. Votre quittance est disponible."
            ),
        )

        # 3. Activer le bail si EN_ATTENTE
        if instance.bail.statut == StatusBail.EN_ATTENTE:
            instance.bail.statut = StatusBail.EN_COURS
            instance.bail.save(update_fields=['statut', 'updated_at'])
            
            # 4. Vérifier automatiquement le locataire (premier paiement validé)
            locataire = instance.locataire
            if not locataire.is_verified:
                locataire.is_verified = True
                # Score de base de 50% après le premier paiement réussi
                locataire.trust_score = max(locataire.trust_score, 50)
                locataire.save(update_fields=['is_verified', 'trust_score', 'updated_at'])


@receiver(post_save, sender='biens.Candidature')
def candidature_post_save(sender, instance, created, **kwargs):
    """
    Signal déclenché après chaque sauvegarde d'une Candidature.
    - Si statut = ACCEPTE → crée automatiquement un Bail (EN_ATTENTE).
    """
    from biens.models import Bail, StatusCandidature, StatusBail
    from django.utils import timezone
    from datetime import timedelta

    if instance.statut == StatusCandidature.ACCEPTE:
        # Vérifier si un bail n'est pas déjà créé pour cette candidature
        # On peut se baser sur le locataire et le bien
        bail_exists = Bail.objects.filter(
            locataire=instance.locataire,
            bien=instance.bien,
            statut__in=[StatusBail.EN_ATTENTE, StatusBail.EN_COURS]
        ).exists()

        if not bail_exists:
            # Créer un bail type (1 an par défaut)
            date_entree = timezone.now().date() + timedelta(days=30)
            date_sortie = date_entree + timedelta(days=365)
            
            Bail.objects.create(
                locataire=instance.locataire,
                bien=instance.bien,
                date_entree=date_entree,
                date_sortie=date_sortie,
                loyer_initial=instance.bien.loyer_hc or 0,
                depot_garantie=(instance.bien.loyer_hc or 0) * 3, # 3 mois par défaut
                statut=StatusBail.EN_ATTENTE
            )

@receiver(post_save, sender='biens.Maintenance')
def maintenance_post_save(sender, instance, created, **kwargs):
    """
    Signal déclenché après chaque sauvegarde d'une Maintenance.
    - Si statut = TERMINE -> augmente le score de confiance du locataire (+5 pts).
    """
    from biens.models import StatusMaintenance
    
    if instance.statut == StatusMaintenance.TERMINE:
        locataire = instance.locataire
        if locataire.trust_score < 100:
            locataire.trust_score = min(locataire.trust_score + 5, 100)
            locataire.save(update_fields=['trust_score', 'updated_at'])
