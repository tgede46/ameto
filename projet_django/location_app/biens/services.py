"""
Service — application biens
Logique métier découplée des views.
"""

from django.db import transaction
from django.core.exceptions import ValidationError

from .models import (
    Bien, Bail, Paiement, PhotoBien,
    StatusBien, StatusBail, StatusPaiement,
)
from notification.models import Notification, TypeNotification


class BienService:
    """Gestion des biens immobiliers."""

    @staticmethod
    def lister_disponibles(filtres: dict = None):
        """Retourne les biens vacants avec filtres optionnels."""
        qs = Bien.objects.filter(statut=StatusBien.VACANT).select_related(
            'categorie', 'type_appartement', 'proprietaire'
        ).prefetch_related('photos_bien')

        if filtres:
            if filtres.get('categorie_id'):
                qs = qs.filter(categorie_id=filtres['categorie_id'])
            if filtres.get('type_appartement_id'):
                qs = qs.filter(type_appartement_id=filtres['type_appartement_id'])
            if filtres.get('loyer_max'):
                qs = qs.filter(loyer_hc__lte=filtres['loyer_max'])
            if filtres.get('loyer_min'):
                qs = qs.filter(loyer_hc__gte=filtres['loyer_min'])

        return qs

    @staticmethod
    def ajouter_photo(bien: Bien, image_file=None, image_base64: str = None,
                      legende: str = '', ordre: int = None) -> PhotoBien:
        """
        Ajoute une photo à un bien.
        Accepte un fichier Django UploadedFile ou une chaîne base64.
        """
        import base64 as b64_module
        import uuid
        from django.core.files.base import ContentFile

        # Vérifier la limite de 20 photos
        if bien.photos_bien.count() >= 20:
            raise ValidationError("Ce bien a déjà atteint la limite de 20 photos.")

        # Déterminer l'ordre si non fourni
        if ordre is None:
            ordre = bien.photos_bien.count()

        photo = PhotoBien(bien=bien, legende=legende, ordre=ordre)

        if image_file:
            photo.image = image_file
        elif image_base64:
            try:
                if ';base64,' in image_base64:
                    header, data_str = image_base64.split(';base64,')
                    ext = header.split('/')[-1]
                else:
                    data_str = image_base64
                    ext = 'jpg'
                data = b64_module.b64decode(data_str)
                filename = f"{uuid.uuid4()}.{ext}"
                photo.image = ContentFile(data, name=filename)
                photo.image_base64 = image_base64
            except Exception as e:
                raise ValidationError(f"Format base64 invalide : {e}")

        photo.save()
        return photo

    @staticmethod
    def supprimer_photo(photo_id: int, bien: Bien) -> bool:
        """Supprime une photo d'un bien."""
        try:
            photo = PhotoBien.objects.get(pk=photo_id, bien=bien)
            # Supprimer le fichier physique
            if photo.image:
                photo.image.delete(save=False)
            photo.delete()
            return True
        except PhotoBien.DoesNotExist:
            return False


class BailService:
    """Gestion des baux."""

    @staticmethod
    @transaction.atomic
    def creer_bail(bien: Bien, locataire, donnees: dict) -> Bail:
        """
        Crée un bail entre un bien et un locataire.
        Valide qu'il n'y a pas déjà un bail EN_COURS.
        """
        bail_existant = Bail.objects.filter(
            bien=bien, statut=StatusBail.EN_COURS
        ).exists()
        if bail_existant:
            raise ValidationError(
                "Ce bien a déjà un bail en cours. Résiliez-le d'abord."
            )

        bail = Bail(bien=bien, locataire=locataire, **donnees)
        bail.statut = StatusBail.EN_COURS
        bail.full_clean()
        bail.save()

        # Notifier le locataire
        Notification.objects.create(
            destinataire=locataire,
            type=TypeNotification.DOCUMENT,
            message=(
                f"Votre bail pour le bien situé à {bien.adresse} "
                f"a été créé. Dates : {bail.date_entree} → {bail.date_sortie}."
            ),
        )
        return bail

    @staticmethod
    def resilier_bail(bail: Bail) -> Bail:
        """Résilie un bail et libère le bien."""
        bail.resilier()
        Notification.objects.create(
            destinataire=bail.locataire,
            type=TypeNotification.DOCUMENT,
            message=(
                f"Votre bail pour {bail.bien.adresse} a été résilié."
            ),
        )
        return bail

    @staticmethod
    def renouveler_bail(bail: Bail, nouvelle_date_sortie) -> Bail:
        """Renouvelle un bail avec une nouvelle date de fin."""
        bail.renouveler(nouvelle_date_sortie)
        Notification.objects.create(
            destinataire=bail.locataire,
            type=TypeNotification.DOCUMENT,
            message=(
                f"Votre bail pour {bail.bien.adresse} a été renouvelé "
                f"jusqu'au {nouvelle_date_sortie}."
            ),
        )
        return bail


class PaiementService:
    """Gestion des paiements."""

    @staticmethod
    def declarer_paiement(bail: Bail, locataire, donnees: dict) -> Paiement:
        """
        Enregistre un paiement déclaré par le locataire.
        Statut initial : EN_ATTENTE.
        """
        paiement = Paiement(bail=bail, locataire=locataire, **donnees)
        paiement.statut = StatusPaiement.EN_ATTENTE
        paiement.save()

        # Notifier l'admin/propriétaire
        Notification.objects.create(
            destinataire=bail.bien.proprietaire,
            type=TypeNotification.QUITTANCE,
            message=(
                f"Nouveau paiement déclaré par {locataire.prenom} {locataire.nom} "
                f"pour {bail.bien.adresse}. Montant : {paiement.montant} CFA. "
                f"Référence : {paiement.reference}."
            ),
        )
        return paiement

    @staticmethod
    def valider_paiement(paiement: Paiement) -> Paiement:
        """
        Valide un paiement (par l'admin).
        Déclenche la création automatique de la Quittance via signal.
        """
        paiement.valider()
        return paiement

    @staticmethod
    def annuler_paiement(paiement: Paiement) -> Paiement:
        """Marque un paiement comme impayé."""
        paiement.annuler()
        Notification.objects.create(
            destinataire=paiement.locataire,
            type=TypeNotification.LOYER_IMPAYE,
            message=(
                f"Votre paiement (réf. {paiement.reference}) "
                f"de {paiement.montant} CFA a été annulé."
            ),
        )
        return paiement
