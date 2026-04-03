"""
Application : comptabilite
Modèle : SystemeComptable
"""

from django.db import models
from django.utils.translation import gettext_lazy as _


# ─────────────────────────────────────────────
# MODÈLE : SystemeComptable
# ─────────────────────────────────────────────

class SystemeComptable(models.Model):
    """
    Récapitulatif comptable sur une période donnée pour un Propriétaire.
    Calcule automatiquement le bénéfice net à partir des paiements validés.
    """

    periode_debut = models.DateField(
        verbose_name=_('Début de période'),
        help_text=_('Date de début de la période comptable'),
    )
    periode_fin = models.DateField(
        null=True,
        blank=True,
        verbose_name=_('Fin de période'),
        help_text=_('Date de fin de la période comptable (optionnel)'),
    )
    total_revenus = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name=_('Total revenus (CFA)'),
        help_text=_('Somme nette propriétaire (90% des loyers validés)'),
    )
    total_commission_admin = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name=_('Total commission administrateur (CFA)'),
        help_text=_('Somme des 10% prélevés sur les loyers validés'),
    )
    total_depense = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name=_('Total dépenses (CFA)'),
        help_text=_('Somme des dépenses : travaux, taxes, frais divers'),
    )
    benefice_net = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name=_('Bénéfice net (CFA)'),
        help_text=_('Calculé : total_revenus - total_depense'),
    )

    # ─── Relation ───
    proprietaire = models.ForeignKey(
        'utilisateur.Proprietaire',
        on_delete=models.CASCADE,
        related_name='systemes_comptables',
        verbose_name=_('Propriétaire'),
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Créé le'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Modifié le'))

    class Meta:
        verbose_name = _('Système comptable')
        verbose_name_plural = _('Systèmes comptables')
        ordering = ['-periode_debut']

    def __str__(self):
        return (
            f"Comptabilité [{self.proprietaire.prenom} {self.proprietaire.nom}] "
            f"— Période : {self.periode_debut}"
        )

    # ─── Méthodes métier ───

    def calculer(self):
        """
        Recalcule total_revenus et benefice_net à partir des Paiements
        avec statut VALIDE sur la période définie.
        Met à jour l'instance en base.
        """
        from biens.models import Paiement, StatusPaiement

        # Filtrer les paiements validés sur la période, pour les biens du propriétaire
        filtres = {
            'statut': StatusPaiement.VALIDE,
            'bail__bien__proprietaire': self.proprietaire,
            'date_paiement__gte': self.periode_debut,
        }
        if self.periode_fin:
            filtres['date_paiement__lte'] = self.periode_fin

        paiements = Paiement.objects.filter(**filtres)

        # Calcul du total net propriétaire et de la commission admin.
        aggregates = paiements.aggregate(
            total_net=models.Sum('montant_proprietaire'),
            total_commission=models.Sum('commission_admin'),
        )
        total_net = aggregates['total_net'] or 0
        total_commission = aggregates['total_commission'] or 0

        self.total_revenus = total_net
        self.total_commission_admin = total_commission
        self.benefice_net = self.total_revenus - self.total_depense
        self.save(
            update_fields=[
                'total_revenus', 'total_commission_admin',
                'benefice_net', 'updated_at',
            ]
        )

        return self.benefice_net
