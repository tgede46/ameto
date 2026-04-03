from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Location App API",
        default_version='v1',
        description="Documentation Swagger / OpenAPI de l'API Location App",
        contact=openapi.Contact(email="support@location-app.local"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)


def api_home(request):
    return JsonResponse({
        'message': 'Bienvenue sur Location App API',
        'help': 'Visitez /api/ pour l’API REST, /admin/ pour l’interface d’administration.',
        'endpoints': {
            'admin': '/admin/',
            'api_utilisateur': '/api/proprietaires/, /api/locataires/, /api/auth/',
            'api_biens': '/api/biens/, /api/bail/, /api/paiements/, /api/quittances/',
            'api_comptabilite': '/api/systemes-comptables/, ...',
            'api_notification': '/api/notifications/, ...',
        },
    })


urlpatterns = [
    # Racine du site (page d’accueil simplifiée)
    path('', api_home, name='api_home'),

    # ── Admin Django ──
    path('admin/', admin.site.urls),

    # ── API REST ──
    path('api/', include('utilisateur.urls')),
    path('api/', include('biens.urls')),
    path('api/', include('comptabilite.urls')),
    path('api/', include('notification.urls')),

    # ── Auth dj-rest-auth (Standard & Social) ──
    path('api/dj-rest-auth/', include('dj_rest_auth.urls')),
    path('api/dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),

    # ── Interface navigable DRF ──
    path('api-auth/', include('rest_framework.urls')),

    # ── Documentation Swagger / Redoc ──
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Servir les fichiers media en développement (images, PDFs)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
