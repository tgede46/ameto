from django.db import models
from django.contrib.auth.models import AbstractUser

class Utilisateur(AbstractUser):
    ROLE_CHOICES = (
        ('CLIENT', 'Client'),
        ('PROPRIETAIRE', 'Propriétaire'),
        ('ADMIN', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CLIENT')
    telephone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # Dossier de location
    cni = models.FileField(upload_to='dossiers/cni/', blank=True, null=True)
    fiche_paie = models.FileField(upload_to='dossiers/paie/', blank=True, null=True)
    revenus = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    nationalite = models.CharField(max_length=100, default='Togolaise')
    is_verified = models.BooleanField(default=False)
    trust_score = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.username} ({self.role})"
