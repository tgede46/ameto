from rest_framework.routers import DefaultRouter
from .views import (
    CategorieViewSet, TypeAppartementViewSet,
    BienViewSet, BailViewSet, PaiementViewSet, QuittanceViewSet,
    MaintenanceViewSet
)

router = DefaultRouter()
router.register(r'categories', CategorieViewSet, basename='categorie')
router.register(r'types-appartement', TypeAppartementViewSet, basename='type-appartement')
router.register(r'biens', BienViewSet, basename='bien')
router.register(r'bail', BailViewSet, basename='bail')
router.register(r'paiements', PaiementViewSet, basename='paiement')
router.register(r'quittances', QuittanceViewSet, basename='quittance')
router.register(r'maintenances', MaintenanceViewSet, basename='maintenance')

urlpatterns = router.urls
