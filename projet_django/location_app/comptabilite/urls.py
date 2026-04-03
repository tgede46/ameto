from rest_framework.routers import DefaultRouter
from .views import SystemeComptableViewSet

router = DefaultRouter()
router.register(r'comptabilite', SystemeComptableViewSet, basename='comptabilite')

urlpatterns = router.urls
