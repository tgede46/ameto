from rest_framework.routers import DefaultRouter
from .views import ProprietaireViewSet, LocataireViewSet, AuthViewSet, TwoFactorAuthViewSet, UtilisateurViewSet

router = DefaultRouter()
router.register(r'utilisateurs', UtilisateurViewSet, basename='utilisateur')
router.register(r'proprietaires', ProprietaireViewSet, basename='proprietaire')
router.register(r'locataires', LocataireViewSet, basename='locataire')
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'2fa', TwoFactorAuthViewSet, basename='2fa')

urlpatterns = router.urls
