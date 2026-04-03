"""
Serializers — application biens
"""

import base64
import uuid
from django.core.files.base import ContentFile
from rest_framework import serializers
from .models import (
    Categorie, TypeAppartement, Bien, Bail, Paiement, Quittance, PhotoBien, VideoBien, Maintenance
)


# ─────────────────────────────────────────────
# Categorie
# ─────────────────────────────────────────────

class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ['id', 'libelle', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


# ─────────────────────────────────────────────
# TypeAppartement
# ─────────────────────────────────────────────

class TypeAppartementSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeAppartement
        fields = ['id', 'libelle', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


# ─────────────────────────────────────────────
# PhotoBien
# ─────────────────────────────────────────────

class PhotoBienSerializer(serializers.ModelSerializer):
    """
    Sérialiseur photo d'un bien.
    Accepte :
      - `image` : upload fichier classique (multipart/form-data)
      - `image_base64` : string base64 encodée (data:image/jpeg;base64,...)
    """

    image_url = serializers.SerializerMethodField(read_only=True)
    # Champ optionnel pour upload via base64 depuis une app mobile
    image_base64_input = serializers.CharField(
        write_only=True,
        required=False,
        help_text="Image encodée en base64 : 'data:image/jpeg;base64,...'",
    )

    class Meta:
        model = PhotoBien
        fields = [
            'id', 'bien', 'image', 'image_url',
            'image_base64_input', 'image_base64',
            'legende', 'ordre', 'created_at',
        ]
        read_only_fields = ['id', 'image_base64', 'image_url', 'created_at']
        extra_kwargs = {'image': {'required': False}}

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        return None

    def validate(self, data):
        # Vérifier qu'au moins une source d'image est fournie
        if not data.get('image') and not data.get('image_base64_input'):
            raise serializers.ValidationError(
                "Fournissez soit un fichier image, soit une image en base64."
            )
        return data

    def create(self, validated_data):
        b64_input = validated_data.pop('image_base64_input', None)

        if b64_input:
            # Décoder la chaîne base64 et créer un fichier
            try:
                if ';base64,' in b64_input:
                    header, data_str = b64_input.split(';base64,')
                    ext = header.split('/')[-1]  # jpeg / png / webp
                else:
                    data_str = b64_input
                    ext = 'jpg'
                image_data = base64.b64decode(data_str)
                filename = f"{uuid.uuid4()}.{ext}"
                validated_data['image'] = ContentFile(image_data, name=filename)
                validated_data['image_base64'] = b64_input
            except Exception as e:
                raise serializers.ValidationError(
                    {'image_base64_input': f"Format base64 invalide : {e}"}
                )

        return super().create(validated_data)


# ─────────────────────────────────────────────
# VideoBien
# ─────────────────────────────────────────────

class VideoBienSerializer(serializers.ModelSerializer):
    """
    Sérialiseur vidéo d'un bien.
    Accepte un fichier vidéo (multipart/form-data)
    """

    video_url = serializers.SerializerMethodField(read_only=True)
    thumbnail_url = serializers.SerializerMethodField(read_only=True)
    file_size_mb = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = VideoBien
        fields = [
            'id', 'bien', 'video', 'video_url',
            'thumbnail', 'thumbnail_url',
            'titre', 'description', 'duree', 'ordre',
            'file_size_mb', 'created_at',
        ]
        read_only_fields = ['id', 'video_url', 'thumbnail_url', 'file_size_mb', 'created_at']

    def get_video_url(self, obj):
        request = self.context.get('request')
        if obj.video and hasattr(obj.video, 'url'):
            url = obj.video.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if obj.thumbnail and hasattr(obj.thumbnail, 'url'):
            url = obj.thumbnail.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_file_size_mb(self, obj):
        return obj.get_file_size()

    def validate_video(self, value):
        # Valider la taille du fichier (max 50 Mo)
        max_size = 50 * 1024 * 1024  # 50 Mo en bytes
        if value.size > max_size:
            raise serializers.ValidationError(
                f'La vidéo est trop volumineuse. Taille max : 50 Mo. Taille actuelle : {round(value.size / (1024 * 1024), 2)} Mo'
            )

        # Valider l'extension
        ext = value.name.split('.')[-1].lower()
        valid_extensions = ['mp4', 'avi', 'mov', 'webm']
        if ext not in valid_extensions:
            raise serializers.ValidationError(
                f'Format de vidéo non supporté. Formats acceptés : {", ".join(valid_extensions)}'
            )

        return value


# ─────────────────────────────────────────────
# Bien
# ─────────────────────────────────────────────

class BienListSerializer(serializers.ModelSerializer):
    """Version allégée pour les listes (performances)."""

    categorie_libelle = serializers.CharField(source='categorie.libelle', read_only=True)
    type_appartement_libelle = serializers.CharField(
        source='type_appartement.libelle', read_only=True
    )
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    photo_principale = serializers.SerializerMethodField()

    class Meta:
        model = Bien
        fields = [
            'id', 'adresse', 'loyer_hc', 'charges', 'statut', 'statut_display',
            'categorie_libelle', 'type_appartement_libelle',
            'latitude', 'longitude', 'photo_principale', 'created_at',
        ]

    def get_photo_principale(self, obj):
        photo = obj.photos_bien.filter(ordre=0).first()
        if photo:
            request = self.context.get('request')
            return PhotoBienSerializer(photo, context={'request': request}).data
        return None


class BienDetailSerializer(serializers.ModelSerializer):
    """Version complète pour le détail d'un bien."""

    photos_bien = PhotoBienSerializer(many=True, read_only=True)
    videos_bien = VideoBienSerializer(many=True, read_only=True)
    categorie = CategorieSerializer(read_only=True)
    type_appartement = TypeAppartementSerializer(read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    # Pour écriture seulement
    categorie_id = serializers.PrimaryKeyRelatedField(
        queryset=Categorie.objects.all(), source='categorie', write_only=True, required=False
    )
    type_appartement_id = serializers.PrimaryKeyRelatedField(
        queryset=TypeAppartement.objects.all(),
        source='type_appartement', write_only=True, required=False, allow_null=True
    )
    proprietaire_id = serializers.PrimaryKeyRelatedField(
        source='proprietaire',
        read_only=True,
    )

    class Meta:
        model = Bien
        fields = [
            'id', 'adresse', 'description', 'equipements',
            'loyer_hc', 'charges', 'latitude', 'longitude',
            'statut', 'statut_display',
            'categorie', 'categorie_id',
            'type_appartement', 'type_appartement_id',
            'proprietaire_id',
            'photos_bien', 'videos_bien',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'statut', 'created_at', 'updated_at', 'photos_bien', 'videos_bien']


# ─────────────────────────────────────────────
# Bail
# ─────────────────────────────────────────────

class BailSerializer(serializers.ModelSerializer):
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    loyer_revise = serializers.SerializerMethodField()

    class Meta:
        model = Bail
        fields = [
            'id', 'bien', 'locataire',
            'date_entree', 'date_sortie',
            'depot_garantie', 'loyer_initial',
            'taux_revision_annuel', 'statut', 'statut_display',
            'loyer_revise', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'statut', 'created_at', 'updated_at']

    def get_loyer_revise(self, obj):
        return float(obj.calculer_revision_loyer())


# ─────────────────────────────────────────────
# Paiement
# ─────────────────────────────────────────────

class PaiementSerializer(serializers.ModelSerializer):
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model = Paiement
        fields = [
            'id', 'bail', 'locataire',
            'date_paiement', 'montant', 'commission_admin', 'montant_proprietaire',
            'reference',
            'statut', 'statut_display',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'commission_admin', 'montant_proprietaire',
            'created_at', 'updated_at',
        ]


# ─────────────────────────────────────────────
# Quittance
# ─────────────────────────────────────────────

class QuittanceSerializer(serializers.ModelSerializer):
    paiement_reference = serializers.CharField(
        source='paiement.reference', read_only=True
    )
    fichier_pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Quittance
        fields = [
            'id', 'paiement', 'paiement_reference',
            'date_emission', 'montant_total',
            'fichier_pdf', 'fichier_pdf_url',
            'created_at',
        ]
        read_only_fields = ['id', 'date_emission', 'created_at']

    def get_fichier_pdf_url(self, obj):
        request = self.context.get('request')
        if obj.fichier_pdf and hasattr(obj.fichier_pdf, 'url'):
            url = obj.fichier_pdf.url
            return request.build_absolute_uri(url) if request else url
        return None


# ─────────────────────────────────────────────
# Maintenance
# ─────────────────────────────────────────────

class MaintenanceSerializer(serializers.ModelSerializer):
    bien_adresse = serializers.ReadOnlyField(source='bien.adresse')
    locataire_nom = serializers.SerializerMethodField()

    class Meta:
        model = Maintenance
        fields = '__all__'

    def get_locataire_nom(self, obj):
        return f"{obj.locataire.first_name} {obj.locataire.nom}"
