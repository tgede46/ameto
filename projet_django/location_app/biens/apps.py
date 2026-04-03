from django.apps import AppConfig


class BiensConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'biens'
    verbose_name = 'Gestion des Biens'

    def ready(self):
        """Enregistre les signals au démarrage de l'application."""
        import biens.signals  # noqa: F401
