from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer
from utilisateur.models import Utilisateur

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Récupère tous les messages envoyés ou reçus par l'utilisateur connecté
        return Message.objects.filter(Q(sender=user) | Q(receiver=user)).order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=['get'])
    def list_contacts(self, request):
        user = request.user
        # Liste les utilisateurs avec qui l'utilisateur a déjà discuté
        senders = Message.objects.filter(receiver=user).values_list('sender', flat=True)
        receivers = Message.objects.filter(sender=user).values_list('receiver', flat=True)
        contact_ids = set(list(senders) + list(receivers))
        
        contacts = Utilisateur.objects.filter(id__in=contact_ids)
        # On pourrait aussi ajouter les propriétaires si l'utilisateur est un client, etc.
        # Pour l'instant on retourne simplement les contacts de discussion
        
        from utilisateur.serializers import UserSerializer
        serializer = UserSerializer(contacts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='conversation/(?P<contact_id>[^/.]+)')
    def get_conversation(self, request, contact_id=None):
        user = request.user
        messages = Message.objects.filter(
            (Q(sender=user) & Q(receiver_id=contact_id)) |
            (Q(sender_id=contact_id) & Q(receiver=user))
        ).order_by('created_at')
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
