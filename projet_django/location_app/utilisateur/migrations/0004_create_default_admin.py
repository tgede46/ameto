from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_default_admin(apps, schema_editor):
    # On récupère le modèle Admin à partir de l'application 'utilisateur'
    # Utiliser apps.get_model permet de manipuler les modèles dans les migrations
    Admin = apps.get_model('utilisateur', 'Admin')
    Utilisateur = apps.get_model('utilisateur', 'Utilisateur')
    
    email = 'admin@gmail.com'
    password = 'admin123'
    
    # Vérifier si l'utilisateur existe déjà pour éviter les doublons
    if not Utilisateur.objects.filter(email=email).exists():
        # Création de l'admin
        # Note : Admin hérite de Utilisateur
        admin_user = Admin.objects.create(
            email=email,
            password=make_password(password),
            prenom='Système',
            nom='Admin',
            telephone='00000000',
            role='ADMIN',
            is_staff=True,
            is_superuser=True,
            is_active=True
        )

def remove_default_admin(apps, schema_editor):
    Utilisateur = apps.get_model('utilisateur', 'Utilisateur')
    Utilisateur.objects.filter(email='admin@gmail.com').delete()

class Migration(migrations.Migration):

    dependencies = [
        ('utilisateur', '0003_twofactorauth'), # Dépend de la dernière migration existante
    ]

    operations = [
        migrations.RunPython(create_default_admin, remove_default_admin),
    ]
