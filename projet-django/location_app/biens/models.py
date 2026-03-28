from django.db import models
from utilisateur.models import Utilisateur

class Bien(models.Model):
    TYPE_CHOICES = (
        ('Habitation', (
            ('STUDIO', 'Studio'),
            ('T1', 'T1'),
            ('T2', 'T2'),
            ('T3+', 'T3+'),
            ('MAISON', 'Maison'),
            ('LOFT', 'Loft'),
            ('VILLA', 'Villa'),
        )),
        ('Professionnel', (
            ('BUREAU', 'Bureau'),
            ('COWORKING', 'Coworking'),
            ('COMMERCIAL', 'Local commercial'),
            ('ENTREPOT', 'Entrepôt'),
        )),
        ('Spécifique', (
            ('PARKING', 'Parking/Box'),
            ('TERRAIN', 'Terrain nu'),
            ('CAVE', 'Cave'),
            ('GARAGE', 'Garage'),
        )),
    )
    
    STATUT_CHOICES = (
        ('DISPONIBLE', 'Disponible'),
        ('LOUE', 'Loué'),
        ('VENDU', 'Vendu'),
        ('TRAVAUX', 'En travaux'),
        ('COMPROMIS', 'Sous compromis'),
        ('RESERVE', 'Réservé'),
    )

    titre = models.CharField(max_length=200)
    description = models.TextField(max_length=5000)
    type_bien = models.CharField(max_length=50, choices=TYPE_CHOICES)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='DISPONIBLE')
    
    # Localisation
    adresse = models.CharField(max_length=255)
    quartier = models.CharField(max_length=100)
    ville = models.CharField(max_length=100, default='Lomé')
    
    # Financier
    prix = models.DecimalField(max_digits=12, decimal_places=2) # En FCFA
    charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    caution = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Technique
    superficie = models.FloatField()
    chambres = models.IntegerField(default=0)
    salles_de_bain = models.IntegerField(default=0)
    
    # Équipements (JSON ou plusieurs BooleanField)
    ascenseur = models.BooleanField(default=False)
    climatisation = models.BooleanField(default=False)
    cuisine_equipee = models.BooleanField(default=False)
    parking = models.BooleanField(default=False)
    
    proprietaire = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='biens')
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titre} - {self.prix} CFA"

class Photo(models.Model):
    bien = models.ForeignKey(Bien, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='biens/')
    is_main = models.BooleanField(default=False)

class Candidature(models.Model):
    STATUT_CHOICES = (
        ('EN_ATTENTE', 'En attente'),
        ('ACCEPTE', 'Accepté'),
        ('REFUSE', 'Refusé'),
    )
    
    bien = models.ForeignKey(Bien, on_delete=models.CASCADE, related_name='candidatures')
    locataire = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='candidatures')
    
    # Documents
    cni = models.FileField(upload_to='candidatures/cni/')
    fiche_paie = models.FileField(upload_to='candidatures/paie/')
    
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Candidature de {self.locataire.username} pour {self.bien.titre}"
