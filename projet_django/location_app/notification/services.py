"""
Service — application notification
Logique métier découplée des views.
"""

from .models import Notification
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


class NotificationService:
    """Gestion des notifications."""

    @staticmethod
    def envoyer(destinataire, type_notif: str, message: str, titre: str = None) -> Notification:
        """
        Crée et envoie une notification à un utilisateur.
        Envoie également la notification en temps réel via WebSocket.
        """
        notif = Notification.objects.create(
            destinataire=destinataire,
            type=type_notif,
            message=message,
            titre=titre or f"Notification {type_notif}",
        )

        # Envoyer la notification via WebSocket
        channel_layer = get_channel_layer()
        group_name = f'notifications_{destinataire.id}'

        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'notification_message',
                'id': notif.id,
                'titre': notif.titre,
                'message': notif.message,
                'type_notification': notif.type,
                'lu': notif.lu,
                'date_envoi': notif.date_envoi.isoformat(),
            }
        )

        return notif

    @staticmethod
    def marquer_toutes_lues(user) -> int:
        """Marque toutes les notifications d'un utilisateur comme lues."""
        return Notification.objects.filter(
            destinataire=user, lu=False
        ).update(lu=True)

    @staticmethod
    def get_non_lues(user):
        """Retourne les notifications non lues d'un utilisateur."""
        return Notification.objects.filter(
            destinataire=user, lu=False
        ).order_by('-date_envoi')
