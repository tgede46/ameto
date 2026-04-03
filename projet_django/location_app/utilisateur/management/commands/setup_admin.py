from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from utilisateur.models import Admin, RoleUtilisateur

class Command(BaseCommand):
    help = "Crée un compte super-administrateur par défaut s'il n'existe pas."

    def handle(self, *args, **options):
        email = "admin@admin.com"
        password = "adminpassword123"

        if not Admin.objects.filter(email=email).exists():
            admin = Admin.objects.create_superuser(
                email=email,
                password=password,
                nom="Super",
                prenom="Admin",
                telephone="0000000000",
            )
            self.stdout.write(self.style.SUCCESS(f"Superadmin créé avec succès ! (Email: {email}, Mdp: {password})"))
        else:
            self.stdout.write(self.style.WARNING("Le compte superadmin existe déjà."))
