from django.db import models
from utilisateur.models import Utilisateur
from biens.models import Bien, Candidature

class Paiement(models.Model):
    METHODE_CHOICES = (
        ('TMONEY', 'T-Money'),
        ('FLOOZ', 'Flooz'),
        ('VIREMENT', 'Virement Bancaire'),
    )
    
    STATUT_CHOICES = (
        ('EN_ATTENTE', 'En attente'),
        ('CONFIRME', 'Confirmé'),
        ('REJETE', 'Rejeté'),
    )

    candidature = models.ForeignKey(Candidature, on_delete=models.CASCADE, related_name='paiements', null=True, blank=True)
    bien = models.ForeignKey(Bien, on_delete=models.CASCADE, related_name='paiements', null=True, blank=True)
    locataire = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='paiements')
    
    montant = models.DecimalField(max_digits=12, decimal_places=2)
    methode = models.CharField(max_length=20, choices=METHODE_CHOICES)
    preuve = models.ImageField(upload_to='paiements/preuves/')
    
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    date_paiement = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Paiement de {self.montant} CFA par {self.locataire.username}"
