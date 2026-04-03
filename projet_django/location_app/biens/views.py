"""
Views — application biens
"""

from rest_framework import viewsets, status, permissions, parsers
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    Bien, Bail, Paiement, Quittance,
    Categorie, TypeAppartement, VideoBien, Maintenance,
)
from .serializers import (
    BienListSerializer, BienDetailSerializer,
    BailSerializer, PaiementSerializer, QuittanceSerializer,
    CategorieSerializer, TypeAppartementSerializer, PhotoBienSerializer, VideoBienSerializer,
    MaintenanceSerializer,
)
from .services import BienService, BailService, PaiementService
from utilisateur.permissions import IsProprietaireUser, IsAdminUser


# ─────────────────────────────────────────────
# Categorie
# ─────────────────────────────────────────────

class CategorieViewSet(viewsets.ModelViewSet):
    """
    GET    /api/categories/        → liste
    POST   /api/categories/        → créer
    GET    /api/categories/{id}/   → détail
    PUT    /api/categories/{id}/   → modifier
    DELETE /api/categories/{id}/   → supprimer
    """
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# ─────────────────────────────────────────────
# TypeAppartement
# ─────────────────────────────────────────────

class TypeAppartementViewSet(viewsets.ModelViewSet):
    """
    GET    /api/types-appartement/        → liste
    POST   /api/types-appartement/        → créer
    GET    /api/types-appartement/{id}/   → détail
    """
    queryset = TypeAppartement.objects.all()
    serializer_class = TypeAppartementSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# ─────────────────────────────────────────────
# Bien
# ─────────────────────────────────────────────

class BienViewSet(viewsets.ModelViewSet):
    """
    GET    /api/biens/                    → liste (biens disponibles publics)
    GET    /api/biens/recents/            → 5 derniers biens créés
    POST   /api/biens/                    → créer un bien
    GET    /api/biens/{id}/               → détail
    PUT    /api/biens/{id}/               → modifier
    DELETE /api/biens/{id}/               → supprimer
    GET    /api/biens/{id}/bail/          → bails du bien
    POST   /api/biens/{id}/photos/        → ajouter une photo (fichier ou base64)
    DELETE /api/biens/{id}/photos/{pk}/   → supprimer une photo
    POST   /api/biens/{id}/videos/        → ajouter une vidéo
    DELETE /api/biens/{id}/videos/{pk}/   → supprimer une vidéo
    """

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]

    def get_queryset(self):
        filtres = {
            'categorie_id': self.request.query_params.get('categorie'),
            'type_appartement_id': self.request.query_params.get('type'),
            'loyer_max': self.request.query_params.get('loyer_max'),
            'loyer_min': self.request.query_params.get('loyer_min'),
        }
        filtres = {k: v for k, v in filtres.items() if v}

        if self.action == 'list':
            return BienService.lister_disponibles(filtres)
        return Bien.objects.select_related(
            'categorie', 'type_appartement', 'proprietaire'
        ).prefetch_related('photos_bien').all()

    def get_serializer_class(self):
        if self.action == 'list':
            return BienListSerializer
        return BienDetailSerializer

    def perform_create(self, serializer):
        """Assigne automatiquement le propriétaire connecté."""
        from utilisateur.models import Proprietaire
        try:
            proprietaire = self.request.user.proprietaire
        except Proprietaire.DoesNotExist:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Seul un propriétaire peut créer un bien.")
        serializer.save(proprietaire=proprietaire)

    # ─── Actions custom ───────────────────────

    @action(detail=False, methods=['get'], url_path='recents')
    def recents(self, request):
        """GET /api/biens/recents/ — Retourne les 5 derniers biens créés."""
        biens = Bien.objects.select_related(
            'categorie', 'type_appartement', 'proprietaire'
        ).prefetch_related('photos_bien').order_by('-created_at')[:5]
        serializer = BienDetailSerializer(biens, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='mes-biens', permission_classes=[IsProprietaireUser])
    def mes_biens(self, request):
        """GET /api/biens/mes-biens/ — Liste tous les biens du propriétaire connecté."""
        try:
            proprietaire = request.user.proprietaire
        except Exception:
            return Response({'detail': 'Utilisateur non identifié comme propriétaire.'}, status=403)
            
        biens = Bien.objects.filter(proprietaire=proprietaire).select_related(
            'categorie', 'type_appartement'
        ).prefetch_related('photos_bien').order_by('-created_at')
        serializer = BienDetailSerializer(biens, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='mes-stats', permission_classes=[IsProprietaireUser])
    def mes_stats(self, request):
        """GET /api/biens/mes-stats/ — Statistiques pour le dashboard propriétaire."""
        try:
            proprietaire = request.user.proprietaire
        except Exception:
            return Response({'detail': 'Utilisateur non identifié comme propriétaire.'}, status=403)

        biens = Bien.objects.filter(proprietaire=proprietaire)
        total = biens.count()
        loues = biens.filter(statut='LOUE').count()
        revenus = sum(b.loyer_hc for b in biens.filter(statut='LOUE'))
        
        # Rendement brut moyen (calcul simplifié)
        # En réalité il faudrait le prix d'achat, on va mettre une valeur démo ou calculer si dispo
        rendement = 7.5 # Valeur par défaut si non calculable
        
        return Response({
            'total_biens': total,
            'biens_loues': loues,
            'taux_occupation': round((loues / total * 100) if total > 0 else 0, 1),
            'revenus_mensuels': revenus,
            'rendement_net': rendement,
            'maintenance_en_attente': Maintenance.objects.filter(bien__proprietaire=proprietaire, statut='EN_ATTENTE').count()
        })

    @action(detail=True, methods=['get'])
    def bail(self, request, pk=None):
        """GET /api/biens/{id}/bail/ — Liste les bails du bien."""
        bien = self.get_object()
        bails = bien.bails.select_related('locataire').all()
        serializer = BailSerializer(bails, many=True)
        return Response(serializer.data)

    @action(
        detail=True, methods=['post'],
        url_path='photos',
        parser_classes=[parsers.MultiPartParser, parsers.JSONParser],
    )
    def ajouter_photo(self, request, pk=None):
        """
        POST /api/biens/{id}/photos/

        Option 1 - Une seule photo :
        {
            "image_base64_input": "data:image/jpeg;base64,...",
            "legende": "Chambre",
            "ordre": 0
        }

        Option 2 - Plusieurs photos (liste) :
        {
            "photos": [
                {"image_base64_input": "data:image/jpeg;base64,...", "legende": "Chambre", "ordre": 0},
                {"image_base64_input": "data:image/png;base64,...", "legende": "Cuisine", "ordre": 1}
            ]
        }
        """
        bien = self.get_object()

        # Vérifier si c'est une liste de photos
        if 'photos' in request.data:
            photos_data = request.data.get('photos', [])
            if not isinstance(photos_data, list):
                return Response(
                    {'detail': 'Le champ "photos" doit être une liste.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            photos_creees = []
            erreurs = []

            for index, photo_data in enumerate(photos_data):
                photo_data['bien'] = bien.pk
                serializer = PhotoBienSerializer(
                    data=photo_data,
                    context={'request': request},
                )
                if serializer.is_valid():
                    try:
                        photo = serializer.save()
                        photos_creees.append(
                            PhotoBienSerializer(photo, context={'request': request}).data
                        )
                    except Exception as e:
                        erreurs.append({'index': index, 'erreur': str(e)})
                else:
                    erreurs.append({'index': index, 'erreurs': serializer.errors})

            return Response({
                'photos_creees': photos_creees,
                'total_creees': len(photos_creees),
                'erreurs': erreurs if erreurs else None,
            }, status=status.HTTP_201_CREATED if photos_creees else status.HTTP_400_BAD_REQUEST)

        # Une seule photo
        else:
            serializer = PhotoBienSerializer(
                data={**request.data, 'bien': bien.pk},
                context={'request': request},
            )
            if serializer.is_valid():
                try:
                    photo = serializer.save()
                    return Response(
                        PhotoBienSerializer(photo, context={'request': request}).data,
                        status=status.HTTP_201_CREATED,
                    )
                except Exception as e:
                    return Response({'detail': str(e)}, status=400)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=True, methods=['delete'],
        url_path=r'photos/(?P<photo_pk>\d+)',
    )
    def supprimer_photo(self, request, pk=None, photo_pk=None):
        """
        DELETE /api/biens/{id}/photos/{photo_pk}/
        Supprime une photo du bien.
        """
        bien = self.get_object()
        success = BienService.supprimer_photo(photo_pk, bien)
        if success:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'detail': 'Photo non trouvée.'}, status=404)

    @action(
        detail=True, methods=['post'],
        url_path='videos',
        parser_classes=[parsers.MultiPartParser, parsers.JSONParser],
    )
    def ajouter_video(self, request, pk=None):
        """
        POST /api/biens/{id}/videos/
        Upload une ou plusieurs vidéos pour le bien.

        Multipart form-data:
        - video: fichier vidéo (MP4, AVI, MOV, WEBM)
        - thumbnail: miniature (optionnel)
        - titre: titre de la vidéo (optionnel)
        - description: description (optionnel)
        - duree: durée en secondes (optionnel)
        - ordre: ordre d'affichage (optionnel, d'éfaut 0)
        """
        bien = self.get_object()

        # Vérifier la limite de 5 vidéos
        if bien.videos_bien.count() >= 5:
            return Response(
                {'detail': 'Un bien ne peut avoir plus de 5 vidéos.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = VideoBienSerializer(
            data={**request.data, 'bien': bien.pk},
            context={'request': request},
        )
        if serializer.is_valid():
            try:
                video = serializer.save()
                return Response(
                    VideoBienSerializer(video, context={'request': request}).data,
                    status=status.HTTP_201_CREATED,
                )
            except Exception as e:
                return Response({'detail': str(e)}, status=400)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=True, methods=['delete'],
        url_path=r'videos/(?P<video_pk>\d+)',
    )
    def supprimer_video(self, request, pk=None, video_pk=None):
        """
        DELETE /api/biens/{id}/videos/{video_pk}/
        Supprime une vidéo du bien.
        """
        bien = self.get_object()
        try:
            video = VideoBien.objects.get(pk=video_pk, bien=bien)
            video.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except VideoBien.DoesNotExist:
            return Response({'detail': 'Vidéo non trouvée.'}, status=404)


# ─────────────────────────────────────────────
# Bail
# ─────────────────────────────────────────────

class BailViewSet(viewsets.ModelViewSet):
    """
    GET    /api/bail/                         → liste
    POST   /api/bail/                         → créer un bail
    GET    /api/bail/{id}/                    → détail
    POST   /api/bail/{id}/resilier/           → résilier
    POST   /api/bail/{id}/renouveler/         → renouveler
    GET    /api/bail/{id}/paiements/          → paiements du bail
    """

    queryset = Bail.objects.select_related('bien', 'locataire').all()
    serializer_class = BailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        bien = serializer.validated_data['bien']
        locataire = serializer.validated_data['locataire']
        donnees = {k: v for k, v in serializer.validated_data.items()
                   if k not in ('bien', 'locataire')}
        BailService.creer_bail(bien, locataire, donnees)

    @action(detail=True, methods=['post'])
    def resilier(self, request, pk=None):
        """POST /api/bail/{id}/resilier/"""
        bail = self.get_object()
        BailService.resilier_bail(bail)
        return Response({'detail': 'Bail résilié.', 'statut': bail.statut})

    @action(detail=True, methods=['post'])
    def renouveler(self, request, pk=None):
        """POST /api/bail/{id}/renouveler/ — Body : { "nouvelle_date_sortie": "YYYY-MM-DD" }"""
        bail = self.get_object()
        nouvelle_date = request.data.get('nouvelle_date_sortie')
        if not nouvelle_date:
            return Response(
                {'detail': 'Champ `nouvelle_date_sortie` requis.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        BailService.renouveler_bail(bail, nouvelle_date)
        return Response({'detail': 'Bail renouvelé.', 'nouvelle_date_sortie': nouvelle_date})

    @action(detail=True, methods=['get'])
    def paiements(self, request, pk=None):
        """GET /api/bail/{id}/paiements/"""
        bail = self.get_object()
        paiements = bail.paiements.all()
        serializer = PaiementSerializer(paiements, many=True)
        return Response(serializer.data)


# ─────────────────────────────────────────────
# Paiement
# ─────────────────────────────────────────────

class PaiementViewSet(viewsets.ModelViewSet):
    """
    GET    /api/paiements/                  → liste
    POST   /api/paiements/                  → déclarer un paiement
    GET    /api/paiements/{id}/             → détail
    POST   /api/paiements/{id}/valider/     → valider (admin/proprio)
    POST   /api/paiements/{id}/annuler/     → annuler
    GET    /api/paiements/{id}/quittance/   → quittance associée
    """

    queryset = Paiement.objects.select_related('bail', 'locataire').all()
    serializer_class = PaiementSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def valider(self, request, pk=None):
        """POST /api/paiements/{id}/valider/"""
        paiement = self.get_object()
        PaiementService.valider_paiement(paiement)
        return Response({'detail': 'Paiement validé. Quittance générée.', 'statut': paiement.statut})

    @action(detail=True, methods=['post'])
    def annuler(self, request, pk=None):
        """POST /api/paiements/{id}/annuler/"""
        paiement = self.get_object()
        PaiementService.annuler_paiement(paiement)
        return Response({'detail': 'Paiement annulé (impayé).', 'statut': paiement.statut})

    @action(detail=True, methods=['get'])
    def quittance(self, request, pk=None):
        """GET /api/paiements/{id}/quittance/"""
        paiement = self.get_object()
        try:
            serializer = QuittanceSerializer(
                paiement.quittance, context={'request': request}
            )
            return Response(serializer.data)
        except Quittance.DoesNotExist:
            return Response({'detail': 'Aucune quittance pour ce paiement.'}, status=404)


# ─────────────────────────────────────────────
# Quittance
# ─────────────────────────────────────────────

class QuittanceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/quittances/        → liste (lecture seule)
    GET /api/quittances/{id}/   → détail
    """

    queryset = Quittance.objects.select_related('paiement').all()
    serializer_class = QuittanceSerializer
    permission_classes = [permissions.IsAuthenticated]


# ─────────────────────────────────────────────
# Maintenance
# ─────────────────────────────────────────────

class MaintenanceViewSet(viewsets.ModelViewSet):
    """
    Gestion des demandes de maintenance.
    Admins : voient tout.
    Proprios : voient les demandes pour leurs biens.
    Locataires : voient leurs propres demandes.
    """
    queryset = Maintenance.objects.all().order_by('-date_signalement')
    serializer_class = MaintenanceSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Maintenance.objects.all()
        elif user.role == 'PROPRIETAIRE':
            return Maintenance.objects.filter(bien__proprietaire=user.proprietaire)
        elif user.role == 'LOCATAIRE':
            return Maintenance.objects.filter(locataire=user.locataire)
        return Maintenance.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role == 'LOCATAIRE':
            serializer.save(locataire=self.request.user.locataire)
        else:
            serializer.save()
