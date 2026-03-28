from rest_framework import serializers
from .models import Message
from utilisateur.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_details = UserSerializer(source='sender', read_only=True)
    receiver_details = UserSerializer(source='receiver', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'text', 'created_at', 'is_read', 'sender_details', 'receiver_details']
        read_only_fields = ['id', 'created_at', 'sender']
