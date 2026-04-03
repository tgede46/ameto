"""
Service — application comptabilite
Logique métier découplée des views.
"""

from .models import SystemeComptable


class ComptabiliteService:
    """Génération et mise à jour des rapports comptables."""

    @staticmethod
    def recalculer(systeme: SystemeComptable) -> SystemeComptable:
        """Recalcule le bénéfice net du système comptable et le sauvegarde."""
        systeme.calculer()
        return systeme

    @staticmethod
    def creer_rapport(proprietaire, periode_debut, periode_fin=None,
                      total_depense=0) -> SystemeComptable:
        """Crée un nouveau rapport comptable et le calcule immédiatement."""
        systeme = SystemeComptable.objects.create(
            proprietaire=proprietaire,
            periode_debut=periode_debut,
            periode_fin=periode_fin,
            total_depense=total_depense,
        )
        systeme.calculer()
        return systeme
