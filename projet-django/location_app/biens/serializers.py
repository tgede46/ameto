from rest_framework import serializers
from .models import Bien, Photo, Candidature

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = ('id', 'image', 'is_main')

class BienSerializer(serializers.ModelSerializer):
    photos = PhotoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Bien
        fields = '__all__'

class CandidatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidature
        fields = '__all__'
        read_only_fields = ('locataire', 'statut', 'date_creation')
