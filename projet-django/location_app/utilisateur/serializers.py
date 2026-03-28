from rest_framework import serializers
from .models import Utilisateur

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'telephone', 'avatar', 'cni', 'fiche_paie', 
            'revenus', 'nationalite', 'is_verified', 'trust_score'
        )
        read_only_fields = ('id', 'is_verified', 'trust_score')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Utilisateur
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'role', 'telephone')

    def create(self, validated_data):
        user = Utilisateur.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'CLIENT'),
            telephone=validated_data.get('telephone', '')
        )
        return user
