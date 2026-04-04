"""
Serializers — application utilisateur
"""

from rest_framework import serializers
from .models import Utilisateur, Proprietaire, Locataire, TwoFactorAuth


# ─────────────────────────────────────────────
# Utilisateur (base)
# ─────────────────────────────────────────────

class UtilisateurSerializer(serializers.ModelSerializer):
    """Sérialiseur lecture pour un utilisateur (tous rôles)."""

    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = Utilisateur
        fields = [
            'id', 'nom', 'prenom', 'email', 'telephone',
            'adresse', 'role', 'role_display', 'actif',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'role_display']


class UtilisateurCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur création d'un utilisateur avec mot de passe."""

    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = Utilisateur
        fields = [
            'nom', 'prenom', 'email', 'telephone',
            'adresse', 'role', 'password', 'password_confirm',
        ]

    def validate(self, data):
        if data['password'] != data.pop('password_confirm'):
            raise serializers.ValidationError(
                {'password_confirm': 'Les mots de passe ne correspondent pas.'}
            )
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Utilisateur(**validated_data)
        user.set_password(password)
        user.save()
        return user


# ─────────────────────────────────────────────
# Proprietaire
# ─────────────────────────────────────────────

class ProprietaireSerializer(serializers.ModelSerializer):
    """Sérialiseur lecture d'un propriétaire."""

    nombre_biens = serializers.SerializerMethodField()

    class Meta:
        model = Proprietaire
        fields = [
            'id', 'nom', 'prenom', 'email', 'telephone',
            'adresse', 'nobre_logement', 'nombre_biens',
            'actif', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'nombre_biens']

    def get_nombre_biens(self, obj):
        return obj.get_nombre_biens()


class ProprietaireCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur création / mise à jour d'un propriétaire."""

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Proprietaire
        fields = [
            'nom', 'prenom', 'email', 'telephone',
            'adresse', 'nobre_logement', 'password',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        prop = Proprietaire(**validated_data)
        prop.set_password(password)
        prop.save()
        return prop


# ─────────────────────────────────────────────
# Locataire
# ─────────────────────────────────────────────

class LocataireSerializer(serializers.ModelSerializer):
    """Sérialiseur lecture d'un locataire."""
    bail_actif = serializers.SerializerMethodField()

    class Meta:

        model = Locataire
        fields = [
            'id', 'nom', 'prenom', 'email', 'telephone',
            'adresse', 'date_naissance', 'profession',
            'personne_a_prevenir', 'nationalite', 'revenus',
            'cni', 'fiche_paie', 'garant', 
            'garant_nom', 'garant_lien', 'garant_telephone',
            'garant_email', 'garant_profession', 'garant_revenus',
            'actif', 'created_at',
            'role', 'is_verified', 'trust_score', 'bail_actif',
        ]
        read_only_fields = ['id', 'created_at', 'garant', 'bail_actif']

    def get_bail_actif(self, obj):
        bail = obj.bail_actif
        if not bail:
            return None
        return {
            'id': bail.id,
            'bien': {
                'id': bail.bien.id,
                'titre': bail.bien.adresse,
                'adresse': bail.bien.adresse,
                'quartier': "Lomé", # Valeurs par défaut car non présentes dans le modèle
                'ville': "Togo",
                'prix': float(bail.bien.loyer_hc),
                'photos': [
                    {'image': p.image.url} for p in bail.bien.photos_bien.all()
                ]
            },
            'bien_titre': bail.bien.adresse,
            'bien_adresse': bail.bien.adresse,
            'date_entree': bail.date_entree,
            'date_fin': bail.date_sortie,
            'loyer': float(bail.loyer_initial),
            'statut': bail.statut,
        }





class LocataireCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur création / mise à jour d'un locataire."""

    password = serializers.CharField(write_only=True, min_length=8, required=False)

    class Meta:
        model = Locataire
        fields = [
            'nom', 'prenom', 'email', 'telephone', 'adresse',
            'date_naissance', 'profession', 'personne_a_prevenir',
            'nationalite', 'revenus', 'cni', 'fiche_paie',
            'garant_nom', 'garant_lien', 'garant_telephone',
            'garant_email', 'garant_profession', 'garant_revenus',
            'password',
        ]


    def create(self, validated_data):
        password = validated_data.pop('password', None)
        loc = Locataire(**validated_data)
        if password:
            loc.set_password(password)
        loc.save()
        return loc

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)


# ─────────────────────────────────────────────
# Two Factor Authentication
# ─────────────────────────────────────────────

class TwoFactorAuthSerializer(serializers.ModelSerializer):
    """Sérialiseur lecture de la configuration 2FA."""

    methode_display = serializers.CharField(source='get_methode_display', read_only=True)
    backup_codes_count = serializers.SerializerMethodField()

    class Meta:
        model = TwoFactorAuth
        fields = [
            'id', 'is_enabled', 'methode', 'methode_display',
            'backup_codes_count', 'verified_at', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'verified_at', 'methode_display']

    def get_backup_codes_count(self, obj):
        """Retourne le nombre de codes de secours restants."""
        return len(obj.backup_codes) if obj.backup_codes else 0


class Enable2FASerializer(serializers.Serializer):
    """Sérialiseur pour activer la 2FA."""

    methode = serializers.ChoiceField(choices=['TOTP', 'EMAIL'], required=True)

    def validate_methode(self, value):
        """Valide la méthode 2FA."""
        if value not in ['TOTP', 'EMAIL']:
            raise serializers.ValidationError("Méthode invalide. Choisir TOTP ou EMAIL.")
        return value


class Verify2FACodeSerializer(serializers.Serializer):
    """Sérialiseur pour vérifier un code 2FA."""

    code = serializers.CharField(min_length=6, max_length=6, required=True)

    def validate_code(self, value):
        """Valide le format du code."""
        if not value.isdigit():
            raise serializers.ValidationError("Le code doit contenir uniquement des chiffres.")
        return value


class VerifyTOTPSerializer(serializers.Serializer):
    """Sérialiseur pour vérifier un code TOTP."""

    code = serializers.CharField(min_length=6, max_length=6, required=True)

    def validate_code(self, value):
        """Valide le format du code TOTP."""
        if not value.isdigit():
            raise serializers.ValidationError("Le code TOTP doit contenir uniquement des chiffres.")
        return value


class VerifyBackupCodeSerializer(serializers.Serializer):
    """Sérialiseur pour vérifier un code de secours."""

    backup_code = serializers.CharField(required=True)

    def validate_backup_code(self, value):
        """Valide le format du code de secours (XXXX-XXXX-XXXX)."""
        parts = value.split('-')
        if len(parts) != 3:
            raise serializers.ValidationError("Format invalide. Attendu: XXXX-XXXX-XXXX")
        for part in parts:
            if len(part) != 4 or not part.isdigit():
                raise serializers.ValidationError("Format invalide. Attendu: XXXX-XXXX-XXXX")
        return value


class Change2FAMethodSerializer(serializers.Serializer):
    """Sérialiseur pour changer la méthode 2FA."""

    methode = serializers.ChoiceField(choices=['TOTP', 'EMAIL'], required=True)
