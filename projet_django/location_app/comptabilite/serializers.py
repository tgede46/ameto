"""
Serializers — application comptabilite
"""

from rest_framework import serializers
from .models import SystemeComptable


class SystemeComptableSerializer(serializers.ModelSerializer):
    proprietaire_nom = serializers.SerializerMethodField()

    class Meta:
        model = SystemeComptable
        fields = [
            'id', 'proprietaire', 'proprietaire_nom',
            'periode_debut', 'periode_fin',
            'total_revenus', 'total_commission_admin', 'total_depense', 'benefice_net',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'benefice_net', 'created_at', 'updated_at']

    def get_proprietaire_nom(self, obj):
        return f"{obj.proprietaire.prenom} {obj.proprietaire.nom}"
