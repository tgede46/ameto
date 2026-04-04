"""
Application : biens
Modèles : Categorie, TypeAppartement, Bien, Bail, Paiement, Quittance, Maintenance
"""

from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from decimal import Decimal, ROUND_HALF_UP


# ─────────────────────────────────────────────
# ÉNUMÉRATIONS
# ─────────────────────────────────────────────

class StatusBien(models.TextChoices):
    LOUE = 'LOUE', _('Loué')
    VACANT = 'VACANT', _('Vacant')
    VENDRE = 'VENDRE', _('À vendre')
    SOUS_COMPROMIS = 'SOUS_COMPROMIS', _('Sous compromis')
    VENDU = 'VENDU', _('Vendu')
    EN_TRAVAUX = 'EN_TRAVAUX', _('En travaux')


class StatusBail(models.TextChoices):
    EN_COURS = 'EN_COURS', _('En cours')
    EXPIRE = 'EXPIRE', _('Expiré')
    RESILE = 'RESILE', _('Résilié')
    EN_ATTENTE = 'EN_ATTENTE', _('En attente')


class StatusPaiement(models.TextChoices):
    PAYE = 'PAYE', _('Payé')
    EN_ATTENTE = 'EN_ATTENTE', _('En attente')
    EN_RETARD = 'EN_RETARD', _('En retard')
    FIN_BAIL_PROCHE = 'FIN_BAIL_PROCHE', _('Fin de bail proche')
    VALIDE = 'VALIDE', _('Validé')
    IMPAYE = 'IMPAYE', _('Impayé')


class StatusMaintenance(models.TextChoices):
    EN_ATTENTE = 'EN_ATTENTE', _('En attente')
    APPROUVE = 'APPROUVE', _('Approuvé')
    EN_COURS = 'EN_COURS', _('En cours')
    TERMINE = 'TERMINE', _('Terminé')
    REFUSE = 'REFUSE', _('Refusé')


class PrioriteMaintenance(models.TextChoices):
    BASSE = 'BASSE', _('Basse')
    MOYENNE = 'MOYENNE', _('Moyenne')
    HAUTE = 'HAUTE', _('Haute')
    URGENT = 'URGENT', _('Urgent')


class StatusCandidature(models.TextChoices):
    EN_ATTENTE = 'EN_ATTENTE', _('En attente')
    ACCEPTE = 'ACCEPTE', _('Acceptée')
    REFUSE = 'REFUSE', _('Refusée')


# ─────────────────────────────────────────────
# MODÈLE : Categorie
# ─────────────────────────────────────────────

class Categorie(models.Model):
    """
    Catégorie d'un bien immobilier.
    Ex : Appartement, Maison, Bureau, Parking, Local commercial, Terrain.
    """

    libelle = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_('Libellé'),
    )
    description = models.TextField(
        null=True,
        blank=True,
        verbose_name=_('Description'),
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Créé le'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Modifié le'))

    class Meta:
        verbose_name = _('Catégorie')
        verbose_name_plural = _('Catégories')
        ordering = ['libelle']

    def __str__(self):
        return self.libelle

    # ─── Méthodes métier ───

    def creer(self):
        self.save()

    def modifier(self, **kwargs):
        for attr, value in kwargs.items():
            setattr(self, attr, value)
        self.save()

    def supprimer(self):
        self.delete()


# ─────────────────────────────────────────────
# MODÈLE : TypeAppartement
# ─────────────────────────────────────────────

class TypeAppartement(models.Model):
    """
    Type d'appartement / logement.
    Ex : Studio, T1, T2, T3+, Chambre salon, Palais, Villa, Suite.
    """

    libelle = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_('Libellé'),
    )
    description = models.TextField(
        null=True,
        blank=True,
        verbose_name=_('Description'),
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Créé le'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Modifié le'))

    class Meta:
        verbose_name = _("Type d'appartement")
        verbose_name_plural = _("Types d'appartement")
        ordering = ['libelle']

    def __str__(self):
        return self.libelle

    # ─── Méthodes métier ───

    def creer(self):
        self.save()

    def modifier(self, **kwargs):
        for attr, value in kwargs.items():
            setattr(self, attr, value)
        self.save()

    def supprimer(self):
        self.delete()


# ─────────────────────────────────────────────
# MODÈLE : Bien
# ─────────────────────────────────────────────

class Bien(models.Model):
    """
    Bien immobilier géré par un propriétaire.
    Règles métier :
      - Un seul Bail EN_COURS à la fois.
      - Statut → LOUE à la création d'un Bail (via signal).
      - Statut → VACANT à la résiliation d'un Bail (via signal).
    """

    adresse = models.CharField(
        max_length=255,
        verbose_name=_('Adresse'),
        help_text=_('Rue, quartier, ville'),
    )
    description = models.TextField(
        max_length=5000,
        blank=True,
        verbose_name=_('Description'),
    )
    equipements = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_('Équipements'),
        help_text=_("Ex : ['ascenseur', 'climatisation', 'parking']"),
    )
    loyer_hc = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_('Loyer hors charges (CFA)'),
    )
    charges = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name=_('Provisions charges (CFA)'),
    )
    latitude = models.FloatField(
        null=True,
        blank=True,
        verbose_name=_('Latitude GPS'),
    )
    longitude = models.FloatField(
        null=True,
        blank=True,
        verbose_name=_('Longitude GPS'),
    )
    statut = models.CharField(
        max_length=20,
        choices=StatusBien.choices,
        default=StatusBien.VACANT,
        verbose_name=_('Statut'),
    )

    # ─── Relations ───
    categorie = models.ForeignKey(
        'biens.Categorie',
        on_delete=models.PROTECT,
        related_name='biens',
        verbose_name=_('Catégorie'),
    )
    type_appartement = models.ForeignKey(
        'biens.TypeAppartement',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='biens',
        verbose_name=_("Type d'appartement"),
    )
    proprietaire = models.ForeignKey(
        'utilisateur.Proprietaire',
        on_delete=models.CASCADE,
        related_name='biens',
        verbose_name=_('Propriétaire'),
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Créé le'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Modifié le'))

    class Meta:
        verbose_name = _('Bien')
        verbose_name_plural = _('Biens')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.adresse} — {self.get_statut_display()}"

    def clean(self):
        # Contrainte : max 20 photos via PhotoBien
        if self.pk and self.photos_bien.count() > 20:
            raise ValidationError(_('Un bien ne peut avoir plus de 20 photos.'))

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    # ─── Méthodes métier ───

    def lister(self):
        """Retourne tous les biens disponibles (statut VACANT)."""
        return Bien.objects.filter(statut=StatusBien.VACANT)

    def bail_en_cours(self):
        """Retourne le bail actif (EN_COURS) du bien, ou None."""
        return self.bails.filter(statut=StatusBail.EN_COURS).first()


# ─────────────────────────────────────────────
# MODÈLE : Bail
# ─────────────────────────────────────────────

class Bail(models.Model):
    """
    Contrat de location entre un Bien et un Locataire.
    Règles métier :
      - depot_garantie <= 3 × loyer_initial (validator custom).
      - Un Bien ne peut avoir qu'un seul Bail EN_COURS.
      - Signal post_save → bien.statut = LOUE à la création.
      - Signal post_save → bien.statut = VACANT à la résiliation.
    """

    date_entree = models.DateField(verbose_name=_("Date d'entrée"))
    date_sortie = models.DateField(verbose_name=_('Date de sortie prévue'))
    depot_garantie = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_('Dépôt de garantie (CFA)'),
    )
    loyer_initial = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_('Loyer initial (CFA)'),
        help_text=_('Loyer au moment de la signature du bail'),
    )
    taux_revision_annuel = models.FloatField(
        default=0.0,
        verbose_name=_('Taux de révision annuel (%)'),
        help_text=_("Ex : 2.0 pour 2% par an"),
    )
    statut = models.CharField(
        max_length=20,
        choices=StatusBail.choices,
        default=StatusBail.EN_ATTENTE,
        verbose_name=_('Statut'),
    )

    # ─── Relations ───
    bien = models.ForeignKey(
        'biens.Bien',
        on_delete=models.PROTECT,
        related_name='bails',
        verbose_name=_('Bien'),
    )
    locataire = models.ForeignKey(
        'utilisateur.Locataire',
        on_delete=models.PROTECT,
        related_name='bails',
        verbose_name=_('Locataire'),
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Créé le'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Modifié le'))

    class Meta:
        verbose_name = _('Bail')
        verbose_name_plural = _('Baux')
        ordering = ['-date_entree']

    def __str__(self):
        return (
            f"Bail [{self.get_statut_display()}] — "
            f"{self.bien.adresse} / {self.locataire.prenom} {self.locataire.nom}"
        )

    def clean(self):
        # Validator : depot_garantie <= 3 × loyer_initial
        if self.depot_garantie and self.loyer_initial:
            if self.depot_garantie > 3 * self.loyer_initial:
                raise ValidationError(
                    _('Le dépôt de garantie ne peut pas dépasser 3 fois le loyer initial.')
                )

        # Contrainte : un Bien ne peut avoir qu'un seul Bail EN_COURS
        if self.statut == StatusBail.EN_COURS:
            baux_en_cours = Bail.objects.filter(
                bien=self.bien,
                statut=StatusBail.EN_COURS,
            ).exclude(pk=self.pk)
            if baux_en_cours.exists():
                raise ValidationError(
                    _('Ce bien a déjà un bail en cours. Résiliez-le avant d\'en créer un nouveau.')
                )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    # ─── Méthodes métier ───

    def renouveler(self, nouvelle_date_sortie):
        """
        Prolonge le bail en mettant à jour date_sortie.
        Passe le statut à EN_COURS si ce n'est pas déjà le cas.
        """
        self.date_sortie = nouvelle_date_sortie
        self.statut = StatusBail.EN_COURS
        self.save()

    def resilier(self):
        """
        Résilie le bail : passe statut à RESILE et libère le bien (VACANT).
        La mise à jour du bien est aussi gérée par le signal post_save.
        """
        self.statut = StatusBail.RESILE
        self.save()
        self.bien.statut = StatusBien.VACANT
        self.bien.save(update_fields=['statut', 'updated_at'])

    def calculer_revision_loyer(self):
        """Retourne le loyer révisé : loyer_initial × (1 + taux/100)."""
        return self.loyer_initial * (1 + self.taux_revision_annuel / 100)

    def generer_quittance(self, paiement):
        """Crée un objet Quittance lié au Paiement validé."""
        quittance, created = Quittance.objects.get_or_create(
            paiement=paiement,
            defaults={'montant_total': paiement.montant},
        )
        return quittance


# ─────────────────────────────────────────────
# MODÈLE : Paiement
# ─────────────────────────────────────────────

class Paiement(models.Model):
    """
    Paiement de loyer effectué par un Locataire dans le cadre d'un Bail.
    Workflow statut :
      EN_ATTENTE → VALIDE  → (signal) → Quittance créée automatiquement
      EN_ATTENTE → IMPAYE  → si non validé après délai
    """

    date_paiement = models.DateField(verbose_name=_('Date de paiement'))
    montant = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_('Montant payé (CFA)'),
    )
    commission_admin = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name=_('Commission administrateur (CFA)'),
        help_text=_('10% du montant du paiement'),
    )
    montant_proprietaire = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name=_('Montant net propriétaire (CFA)'),
        help_text=_('90% du montant du paiement'),
    )
    reference = models.CharField(
        max_length=100,
        unique=True,
        verbose_name=_('Référence'),
        help_text=_('Ex : numéro de reçu T-Money / Flooz'),
    )
    statut = models.CharField(
        max_length=20,
        choices=StatusPaiement.choices,
        default=StatusPaiement.EN_ATTENTE,
        verbose_name=_('Statut'),
    )

    # ─── Relations ───
    bail = models.ForeignKey(
        'biens.Bail',
        on_delete=models.CASCADE,
        related_name='paiements',
        verbose_name=_('Bail'),
    )
    locataire = models.ForeignKey(
        'utilisateur.Locataire',
        on_delete=models.PROTECT,
        related_name='paiements',
        verbose_name=_('Locataire'),
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Créé le'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Modifié le'))

    class Meta:
        verbose_name = _('Paiement')
        verbose_name_plural = _('Paiements')
        ordering = ['-date_paiement']

    COMMISSION_RATE = Decimal('0.10')

    def __str__(self):
        return (
            f"Paiement {self.reference} — "
            f"{self.montant} CFA [{self.get_statut_display()}]"
        )

    # ─── Méthodes métier ───

    def calculer_repartition(self):
        """Calcule la répartition 10% admin / 90% propriétaire."""
        montant = self.montant or Decimal('0')
        self.commission_admin = (montant * self.COMMISSION_RATE).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )
        self.montant_proprietaire = (montant - self.commission_admin).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

    def save(self, *args, **kwargs):
        # Toujours garder les montants dérivés cohérents avec le montant payé.
        self.calculer_repartition()
        super().save(*args, **kwargs)

    def valider(self):
        """
        Valide le paiement (statut → VALIDE).
        La création de la Quittance est déclenchée via le signal post_save.
        """
        self.statut = StatusPaiement.VALIDE
        self.save(update_fields=['statut', 'updated_at'])

    def annuler(self):
        """Annule le paiement (statut → IMPAYE)."""
        self.statut = StatusPaiement.IMPAYE
        self.save(update_fields=['statut', 'updated_at'])


# ─────────────────────────────────────────────
# MODÈLE : Quittance
# ─────────────────────────────────────────────

class Quittance(models.Model):
    """
    Quittance de loyer générée automatiquement après validation d'un Paiement.
    Relation OneToOne avec Paiement.
    """

    date_emission = models.DateField(
        auto_now_add=True,
        verbose_name=_("Date d'émission"),
    )
    montant_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_('Montant total (CFA)'),
    )
    fichier_pdf = models.FileField(
        upload_to='quittances/pdfs/',
        null=True,
        blank=True,
        verbose_name=_('Fichier PDF'),
    )

    # ─── Relation ───
    paiement = models.OneToOneField(
        'biens.Paiement',
        on_delete=models.CASCADE,
        related_name='quittance',
        verbose_name=_('Paiement associé'),
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Créé le'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Modifié le'))

    class Meta:
        verbose_name = _('Quittance')
        verbose_name_plural = _('Quittances')
        ordering = ['-date_emission']

    def __str__(self):
        return (
            f"Quittance du {self.date_emission} — "
            f"{self.montant_total} CFA"
        )


# ─────────────────────────────────────────────
# MODÈLE : PhotoBien
# ─────────────────────────────────────────────

class PhotoBien(models.Model):
    """
    Photo associée à un Bien immobilier.
    Max 20 photos par bien (validé dans Bien.clean()).
    """

    bien = models.ForeignKey(
        'biens.Bien',
        on_delete=models.CASCADE,
        related_name='photos_bien',
        verbose_name=_('Bien'),
    )
    image = models.ImageField(
        upload_to='biens/photos/%Y/%m/',
        verbose_name=_('Fichier image'),
        help_text=_('Formats acceptés : JPG, PNG, WEBP — Max 5 Mo'),
    )
    image_base64 = models.TextField(
        blank=True,
        verbose_name=_('Image encodée (Base64)'),
        help_text=_('Rempli automatiquement à la sauvegarde via l\'API'),
    )
    legende = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Légende'),
        help_text=_("Ex : Chambre principale, Cuisine, Vue de la terrasse"),
    )
    ordre = models.PositiveSmallIntegerField(
        default=0,
        verbose_name=_('Ordre d\'affichage'),
        help_text=_('0 = photo principale'),
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Créé le'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Modifié le'))

    class Meta:
        verbose_name = _('Photo du bien')
        verbose_name_plural = _('Photos du bien')
        ordering = ['bien', 'id']

    def __str__(self):
        return f"Photo — {self.bien.adresse}"


# ─────────────────────────────────────────────
# MODÈLE : VideoBien
# ─────────────────────────────────────────────

class VideoBien(models.Model):
    """
    Vidéo associée à un Bien immobilier.
    Max 5 vidéos par bien.
    Formats acceptés : MP4, AVI, MOV, WEBM
    """

    bien = models.ForeignKey(
        'biens.Bien',
        on_delete=models.CASCADE,
        related_name='videos_bien',
        verbose_name=_('Bien'),
    )
    video = models.FileField(
        upload_to='biens/videos/%Y/%m/',
        verbose_name=_('Fichier vidéo'),
        help_text=_('Formats acceptés : MP4, AVI, MOV, WEBM — Max 50 Mo'),
    )
    thumbnail = models.ImageField(
        upload_to='biens/videos/thumbnails/%Y/%m/',
        null=True,
        blank=True,
        verbose_name=_('Miniature'),
        help_text=_('Image de prévisualisation de la vidéo'),
    )
    titre = models.CharField(
        max_length=200,
        blank=True,
        verbose_name=_('Titre'),
        help_text=_("Ex : Visite virtuelle, Tour de la propriété"),
    )
    description = models.TextField(
        blank=True,
        verbose_name=_('Description'),
    )
    duree = models.IntegerField(
        null=True,
        blank=True,
        verbose_name=_('Durée (secondes)'),
        help_text=_('Durée de la vidéo en secondes'),
    )
    ordre = models.PositiveSmallIntegerField(
        default=0,
        verbose_name=_('Ordre d\'affichage'),
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Créé le'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Modifié le'))

    class Meta:
        verbose_name = _('Vidéo du bien')
        verbose_name_plural = _('Vidéos du bien')
        ordering = ['bien', 'id']

    def __str__(self):
        return f"Vidéo — {self.bien.adresse}"


# ─────────────────────────────────────────────
# MODÈLE : Maintenance
# ─────────────────────────────────────────────

class Maintenance(models.Model):
    """
    Demande de maintenance signalée par un locataire.
    """

    titre = models.CharField(max_length=200, verbose_name=_('Titre'))
    description = models.TextField(verbose_name=_('Description'))
    priorite = models.CharField(
        max_length=20,
        choices=PrioriteMaintenance.choices,
        default=PrioriteMaintenance.MOYENNE,
        verbose_name=_('Priorité'),
    )
    statut = models.CharField(
        max_length=20,
        choices=StatusMaintenance.choices,
        default=StatusMaintenance.EN_ATTENTE,
        verbose_name=_('Statut'),
    )
    cout_estime = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Coût estimé (CFA)'),
    )
    justificatif = models.ImageField(
        upload_to='maintenances/justificatifs/%Y/%m/',
        null=True,
        blank=True,
        verbose_name=_('Justificatif (photo/reçu)'),
    )
    justificatif_commentaire = models.TextField(
        blank=True,
        verbose_name=_('Commentaire justificatif'),
    )
    date_envoi_justificatif = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Date d\'envoi du justificatif'),
    )
    date_signalement = models.DateTimeField(auto_now_add=True)

    # ─── Relations ───
    bien = models.ForeignKey(
        'biens.Bien',
        on_delete=models.CASCADE,
        related_name='maintenances',
        verbose_name=_('Bien'),
    )
    locataire = models.ForeignKey(
        'utilisateur.Locataire',
        on_delete=models.CASCADE,
        related_name='maintenances_signalees',
        verbose_name=_('Locataire'),
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Maintenance')
        verbose_name_plural = _('Maintenances')
        ordering = ['-date_signalement']

    def __str__(self):
        return f"Maintenance #{self.id} - {self.titre} ({self.bien.adresse})"


# ─────────────────────────────────────────────
# MODÈLE : Candidature
# ─────────────────────────────────────────────

class Candidature(models.Model):
    """
    Candidature d'un locataire pour un bien.
    """
    bien = models.ForeignKey(
        'biens.Bien',
        on_delete=models.CASCADE,
        related_name='candidatures',
        verbose_name=_('Bien'),
    )
    locataire = models.ForeignKey(
        'utilisateur.Locataire',
        on_delete=models.CASCADE,
        related_name='candidatures',
        verbose_name=_('Locataire'),
    )
    message = models.TextField(blank=True, verbose_name=_('Message'))
    statut = models.CharField(
        max_length=20,
        choices=StatusCandidature.choices,
        default=StatusCandidature.EN_ATTENTE,
        verbose_name=_('Statut'),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Candidature')
        verbose_name_plural = _('Candidatures')
        ordering = ['-created_at']

    def __str__(self):
        return f"Candidature #{self.id} - {self.locataire} ({self.bien.adresse})"

