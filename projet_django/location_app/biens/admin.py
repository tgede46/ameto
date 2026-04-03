from django.contrib import admin
from .models import Categorie, TypeAppartement, Bien, Bail, Paiement, Quittance, PhotoBien, VideoBien, Maintenance

@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ('libelle', 'created_at')

@admin.register(TypeAppartement)
class TypeAppartementAdmin(admin.ModelAdmin):
    list_display = ('libelle', 'created_at')

@admin.register(Bien)
class BienAdmin(admin.ModelAdmin):
    list_display = ('adresse', 'categorie', 'loyer_hc', 'statut', 'proprietaire')
    list_filter = ('statut', 'categorie')
    search_fields = ('adresse', 'description')

@admin.register(Bail)
class BailAdmin(admin.ModelAdmin):
    list_display = ('bien', 'locataire', 'date_entree', 'date_sortie', 'statut')
    list_filter = ('statut',)

@admin.register(Paiement)
class PaiementAdmin(admin.ModelAdmin):
    list_display = ('reference', 'montant', 'date_paiement', 'statut', 'locataire')
    list_filter = ('statut',)

@admin.register(Quittance)
class QuittanceAdmin(admin.ModelAdmin):
    list_display = ('paiement', 'montant_total', 'date_emission')

@admin.register(PhotoBien)
class PhotoBienAdmin(admin.ModelAdmin):
    list_display = ('bien', 'ordre', 'created_at')

@admin.register(VideoBien)
class VideoBienAdmin(admin.ModelAdmin):
    list_display = ('bien', 'titre', 'ordre')

@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = ('titre', 'bien', 'priorite', 'statut', 'date_signalement')
    list_filter = ('statut', 'priorite')
