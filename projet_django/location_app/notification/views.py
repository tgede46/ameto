"""
Views — application notification
"""

from django.db.models import Q, Max, Count
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification, Message, TypeNotification
from .serializers import NotificationSerializer, MessageSerializer
from .services import NotificationService
from utilisateur.models import Utilisateur
from utilisateur.models import RoleUtilisateur
from biens.models import Bail, Candidature


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET    /api/notifications/                      → liste des notifications de l'utilisateur connecté
    GET    /api/notifications/{id}/                 → détail
    POST   /api/notifications/{id}/marquer-lu/      → marquer comme lue
    POST   /api/notifications/marquer-tout-lu/      → marquer toutes comme lues
    GET    /api/notifications/non-lues/             → seulement les non lues
    """

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Chaque utilisateur ne voit que ses propres notifications."""
        if getattr(self, 'swagger_fake_view', False):
            return Notification.objects.none()

        if not self.request.user.is_authenticated:
            return Notification.objects.none()

        return Notification.objects.filter(
            destinataire=self.request.user
        ).order_by('-date_envoi')

    @action(detail=True, methods=['post'], url_path='marquer-lu')
    def marquer_lu(self, request, pk=None):
        """POST /api/notifications/{id}/marquer-lu/"""
        notif = self.get_object()
        notif.marquer_lu()
        return Response({'detail': 'Notification marquée comme lue.'})

    @action(detail=False, methods=['post'], url_path='marquer-tout-lu')
    def marquer_tout_lu(self, request):
        """POST /api/notifications/marquer-tout-lu/"""
        count = NotificationService.marquer_toutes_lues(request.user)
        return Response({'detail': f'{count} notification(s) marquée(s) comme lue(s).'})

    @action(detail=False, methods=['get'], url_path='non-lues')
    def non_lues(self, request):
        """GET /api/notifications/non-lues/"""
        qs = NotificationService.get_non_lues(request.user)
        serializer = self.get_serializer(qs, many=True)
        return Response({
            'count': qs.count(),
            'results': serializer.data,
        })


class MessageViewSet(viewsets.ModelViewSet):
    """
    GET    /api/messages/                               → messages de l'utilisateur
    POST   /api/messages/                               → envoyer un message
    GET    /api/messages/{id}/                          → détail
    POST   /api/messages/{id}/marquer-lu/               → marquer comme lu
    GET    /api/messages/conversation/{user_id}/        → conversation avec un utilisateur
    """

    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Message.objects.none()

        if not self.request.user.is_authenticated:
            return Message.objects.none()

        return Message.objects.filter(
            Q(expediteur=self.request.user) | Q(destinataire=self.request.user)
        ).select_related('expediteur', 'destinataire').order_by('-created_at')

    def perform_create(self, serializer):
        message = serializer.save(expediteur=self.request.user)

        NotificationService.envoyer(
            destinataire=message.destinataire,
            type_notif=TypeNotification.DOCUMENT,
            titre='Nouveau message',
            message=(
                f"Nouveau message de {message.expediteur.prenom} {message.expediteur.nom}: "
                f"{message.contenu[:80]}"
            ),
        )

    @action(detail=False, methods=['get'], url_path='conversations')
    def conversations(self, request):
        """GET /api/messages/conversations/ — Liste des conversations groupées par utilisateur."""
        user = request.user

        # 1) Utilisateurs déjà contactés via messages
        other_user_pairs = Message.objects.filter(
            Q(expediteur=user) | Q(destinataire=user)
        ).values_list('expediteur_id', 'destinataire_id')

        # Flatten and unique, excluding self
        ids = set()
        for exp, dest in other_user_pairs:
            if exp != user.id:
                ids.add(exp)
            if dest != user.id:
                ids.add(dest)

        # 2) Interlocuteurs métiers possibles, même sans message existant
        if user.role == RoleUtilisateur.PROPRIETAIRE:
            locataire_ids = Bail.objects.filter(
                bien__proprietaire_id=user.id
            ).values_list('locataire_id', flat=True)
            candidature_locataire_ids = Candidature.objects.filter(
                bien__proprietaire_id=user.id
            ).values_list('locataire_id', flat=True)
            ids.update(locataire_ids)
            ids.update(candidature_locataire_ids)

        elif user.role == RoleUtilisateur.LOCATAIRE:
            proprietaire_ids = Bail.objects.filter(
                locataire_id=user.id
            ).values_list('bien__proprietaire_id', flat=True)
            candidature_proprietaire_ids = Candidature.objects.filter(
                locataire_id=user.id
            ).values_list('bien__proprietaire_id', flat=True)
            ids.update(proprietaire_ids)
            ids.update(candidature_proprietaire_ids)

        ids.discard(user.id)

        conversations = []
        for other_id in ids:
            try:
                other_user = Utilisateur.objects.get(pk=other_id)
            except Utilisateur.DoesNotExist:
                continue

            last_msg = Message.objects.filter(
                (Q(expediteur=user) & Q(destinataire=other_user)) |
                (Q(expediteur=other_user) & Q(destinataire=user))
            ).order_by('-created_at').first()
            
            conversations.append({
                'id': other_id,  # On utilise l'ID de l'autre utilisateur comme ID de conversation
                'other_user_id': other_id,
                'other_user_nom': f"{other_user.prenom} {other_user.nom}".strip(),
                'other_user_role': other_user.role,
                'last_message': last_msg.contenu if last_msg else '',
                'last_message_date': last_msg.created_at if last_msg else None,
                'unread_count': Message.objects.filter(expediteur=other_user, destinataire=user, lu=False).count()
            })
            
        return Response(sorted(conversations, key=lambda x: x['last_message_date'] or '', reverse=True))

    @action(detail=False, methods=['get'], url_path='conversation/(?P<user_id>[^/.]+)')
    def conversation(self, request, user_id=None):
        """GET /api/messages/conversation/{user_id}/ — Messages avec un utilisateur spécifique."""
        user = request.user
        try:
            other_user = Utilisateur.objects.get(pk=user_id)
        except Utilisateur.DoesNotExist:
            return Response({'detail': 'Utilisateur non trouvé.'}, status=404)
            
        messages = Message.objects.filter(
            (Q(expediteur=user) & Q(destinataire=other_user)) |
            (Q(expediteur=other_user) & Q(destinataire=user))
        ).order_by('created_at')
        
        # Marquer comme lu
        messages.filter(destinataire=user, lu=False).update(lu=True)
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
