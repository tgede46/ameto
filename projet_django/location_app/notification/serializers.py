"""
Serializers — application notification
"""

from rest_framework import serializers
from .models import Notification, Message


class NotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    destinataire_nom = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'destinataire', 'destinataire_nom',
            'type', 'type_display', 'titre',
            'message', 'lu', 'date_envoi',
            'created_at',
        ]
        read_only_fields = ['id', 'date_envoi', 'created_at']

    def get_destinataire_nom(self, obj):
        return f"{obj.destinataire.prenom} {obj.destinataire.nom}"


class MessageSerializer(serializers.ModelSerializer):
    expediteur_nom = serializers.SerializerMethodField(read_only=True)
    destinataire_nom = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Message
        fields = [
            'id',
            'expediteur', 'expediteur_nom',
            'destinataire', 'destinataire_nom',
            'contenu', 'lu', 'date_lecture',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'expediteur', 'expediteur_nom',
            'lu', 'date_lecture', 'created_at', 'updated_at',
        ]

    def get_expediteur_nom(self, obj):
        return f"{obj.expediteur.prenom} {obj.expediteur.nom}"

    def get_destinataire_nom(self, obj):
        return f"{obj.destinataire.prenom} {obj.destinataire.nom}"
