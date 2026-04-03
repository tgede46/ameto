"""
WebSocket Consumer pour les notifications en temps réel
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    Consumer WebSocket pour recevoir les notifications en temps réel.

    URL: ws://localhost:8000/ws/notifications/

    Messages envoyés au client:
    {
        "type": "notification",
        "id": 1,
        "titre": "Nouveau paiement",
        "message": "Un paiement de 50000 CFA a été reçu",
        "type_notification": "PAIEMENT",
        "lu": false,
        "date_envoi": "2026-03-20T16:00:00Z"
    }
    """

    async def connect(self):
        """
        Appelé quand le WebSocket se connecte.
        Ajoute l'utilisateur à son groupe de notifications.
        """
        self.user = self.scope['user']

        # Vérifier si l'utilisateur est authentifié
        if self.user.is_anonymous:
            await self.close()
            return

        # Nom du groupe : notifications_{user_id}
        self.group_name = f'notifications_{self.user.id}'

        # Rejoindre le groupe
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        # Envoyer un message de confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connecté aux notifications en temps réel'
        }))

    async def disconnect(self, close_code):
        """
        Appelé quand le WebSocket se déconnecte.
        Retire l'utilisateur de son groupe de notifications.
        """
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """
        Appelé quand on reçoit un message du client.
        Peut être utilisé pour marquer une notification comme lue.
        """
        try:
            data = json.loads(text_data)
            action = data.get('action')

            if action == 'mark_as_read':
                notification_id = data.get('notification_id')
                await self.mark_notification_as_read(notification_id)

                await self.send(text_data=json.dumps({
                    'type': 'notification_marked',
                    'notification_id': notification_id,
                    'message': 'Notification marquée comme lue'
                }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def notification_message(self, event):
        """
        Appelé quand une notification est envoyée au groupe.
        Envoie la notification au client WebSocket.
        """
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'id': event['id'],
            'titre': event['titre'],
            'message': event['message'],
            'type_notification': event['type_notification'],
            'lu': event['lu'],
            'date_envoi': event['date_envoi'],
        }))

    @database_sync_to_async
    def mark_notification_as_read(self, notification_id):
        """
        Marque une notification comme lue dans la base de données.
        """
        from notification.models import Notification
        try:
            notification = Notification.objects.get(
                id=notification_id,
                destinataire=self.user
            )
            notification.marquer_comme_lu()
        except Notification.DoesNotExist:
            pass
