"""
Views — application utilisateur
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Proprietaire, Locataire, TwoFactorAuth, Utilisateur
from .serializers import (
    UtilisateurSerializer,
    ProprietaireSerializer, ProprietaireCreateSerializer,
    LocataireSerializer, LocataireCreateSerializer,
    TwoFactorAuthSerializer, Enable2FASerializer,
    Verify2FACodeSerializer, VerifyTOTPSerializer,
    VerifyBackupCodeSerializer, Change2FAMethodSerializer,
)
from .services import UtilisateurService
from .permissions import IsAdminUser, IsProprietaireUser, IsLocataireUser
from .two_factor import TwoFactorAuthService
from django.utils import timezone


# ─────────────────────────────────────────────
# Utilisateur (Global)
# ─────────────────────────────────────────────

class UtilisateurViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lecture seule pour les administrateurs.
    GET    /api/utilisateurs/          → liste de tous les utilisateurs
    GET    /api/utilisateurs/{id}/     → détail
    """
    queryset = Utilisateur.objects.all().order_by('-created_at')
    serializer_class = UtilisateurSerializer
    permission_classes = [IsAdminUser]


# ─────────────────────────────────────────────
# Propriétaire
# ─────────────────────────────────────────────

class ProprietaireViewSet(viewsets.ModelViewSet):
    """
    CRUD complet pour les propriétaires.
    GET    /api/proprietaires/          → liste
    POST   /api/proprietaires/          → créer
    GET    /api/proprietaires/{id}/     → détail
    PUT    /api/proprietaires/{id}/     → modifier
    DELETE /api/proprietaires/{id}/     → supprimer
    POST   /api/proprietaires/{id}/desactiver/ → désactiver compte
    """

    queryset = Proprietaire.objects.all().order_by('-created_at')
    permission_classes = [IsProprietaireUser]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProprietaireCreateSerializer
        return ProprietaireSerializer

    @action(detail=True, methods=['post'])
    def desactiver(self, request, pk=None):
        """POST /api/proprietaires/{id}/desactiver/ — Désactive le compte."""
        success = UtilisateurService.desactiver_compte(pk)
        if success:
            return Response({'detail': 'Compte désactivé.'})
        return Response({'detail': 'Propriétaire non trouvé.'}, status=404)

    @action(detail=True, methods=['get'])
    def biens(self, request, pk=None):
        """GET /api/proprietaires/{id}/biens/ — Liste les biens du propriétaire."""
        from biens.serializers import BienListSerializer
        proprietaire = self.get_object()
        biens = proprietaire.biens.all()
        serializer = BienListSerializer(biens, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def comptabilite(self, request, pk=None):
        """GET /api/proprietaires/{id}/comptabilite/ — Rapports comptables."""
        from comptabilite.serializers import SystemeComptableSerializer
        from comptabilite.models import SystemeComptable
        proprietaire = self.get_object()
        rapports = SystemeComptable.objects.filter(proprietaire=proprietaire)
        serializer = SystemeComptableSerializer(rapports, many=True)
        return Response(serializer.data)


# ─────────────────────────────────────────────
# Locataire
# ─────────────────────────────────────────────

class LocataireViewSet(viewsets.ModelViewSet):
    """
    CRUD complet pour les locataires.
    GET    /api/locataires/             → liste
    POST   /api/locataires/             → créer
    GET    /api/locataires/{id}/        → détail
    PUT    /api/locataires/{id}/        → modifier
    DELETE /api/locataires/{id}/        → supprimer
    GET    /api/locataires/{id}/bail/   → bails du locataire
    GET    /api/locataires/{id}/paiements/ → paiements du locataire
    """

    queryset = Locataire.objects.all().order_by('-created_at')
    permission_classes = [IsLocataireUser]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return LocataireCreateSerializer
        return LocataireSerializer

    @action(detail=True, methods=['get'])
    def bail(self, request, pk=None):
        """GET /api/locataires/{id}/bail/ — Bails du locataire."""
        from biens.serializers import BailSerializer
        locataire = self.get_object()
        bails = locataire.bails.select_related('bien').all()
        serializer = BailSerializer(bails, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def paiements(self, request, pk=None):
        """GET /api/locataires/{id}/paiements/ — Paiements du locataire."""
        from biens.serializers import PaiementSerializer
        locataire = self.get_object()
        paiements = locataire.paiements.all()
        serializer = PaiementSerializer(paiements, many=True)
        return Response(serializer.data)


# ─────────────────────────────────────────────
# Auth
# ─────────────────────────────────────────────

class AuthViewSet(viewsets.ViewSet):
    """
    Endpoints d'authentification.
    POST /api/auth/login/              → connexion (email + password)
    POST /api/auth/changer-password/   → changer mot de passe
    """

    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        """
        POST /api/auth/register/
        Body : { "email": "...", "password": "...", "nom": "...", "prenom": "...", "role": "..." }
        """
        role = request.data.get('role')
        
        # Mapping role frontend vers backend si nécessaire
        if role == 'CLIENT':
            role = 'LOCATAIRE'
        
        if role == 'PROPRIETAIRE':
            serializer = ProprietaireCreateSerializer(data=request.data)
        elif role == 'LOCATAIRE':
            serializer = LocataireCreateSerializer(data=request.data)
        else:
            return Response(
                {'detail': 'Rôle non valide pour l\'inscription.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if serializer.is_valid():
            user = serializer.save()
            tokens = UtilisateurService.get_tokens(user)
            user_data = UtilisateurSerializer(user).data
            return Response({
                'utilisateur': user_data,
                **tokens,
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get', 'patch'],
            permission_classes=[permissions.IsAuthenticated])
    def profile(self, request):
        """
        GET /api/auth/profile/      → Retourne le profil de l'utilisateur connecté.
        PATCH /api/auth/profile/    → Met à jour le profil de l'utilisateur connecté.
        """
        user = request.user
        if request.method == 'PATCH':
            # Utiliser le serializer approprié selon le rôle
            if user.role == 'PROPRIETAIRE' and hasattr(user, 'proprietaire'):
                serializer = ProprietaireCreateSerializer(user.proprietaire, data=request.data, partial=True)
            elif user.role == 'LOCATAIRE' and hasattr(user, 'locataire'):
                serializer = LocataireCreateSerializer(user.locataire, data=request.data, partial=True)
            else:
                serializer = UtilisateurSerializer(user, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        serializer = UtilisateurSerializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='token/refresh', permission_classes=[permissions.AllowAny])
    def token_refresh(self, request):
        """
        POST /api/auth/token/refresh/
        Body : { "refresh": "..." }
        """
        from rest_framework_simplejwt.serializers import TokenRefreshSerializer
        serializer = TokenRefreshSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='token/verify', permission_classes=[permissions.AllowAny])
    def token_verify(self, request):
        """
        POST /api/auth/token/verify/
        Body : { "token": "..." }
        """
        from rest_framework_simplejwt.serializers import TokenVerifySerializer
        serializer = TokenVerifySerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            return Response({}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        """
        POST /api/auth/login/
        Body : { "email": "...", "password": "..." } ou { "username": "...", "password": "..." }
        """
        email = request.data.get('email') or request.data.get('username')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'detail': 'Email et mot de passe requis.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = UtilisateurService.authentifier(email, password)
        if user is None:
            return Response(
                {'detail': 'Identifiants incorrects.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        tokens = UtilisateurService.get_tokens(user)
        return Response({
            'utilisateur': UtilisateurSerializer(user).data,
            **tokens,
        })

    @action(detail=False, methods=['post'],
            permission_classes=[permissions.IsAuthenticated])
    def changer_password(self, request):
        """
        POST /api/auth/changer-password/
        Body : { "ancien_password": "...", "nouveau_password": "..." }
        """
        ancien = request.data.get('ancien_password')
        nouveau = request.data.get('nouveau_password')

        if not ancien or not nouveau:
            return Response(
                {'detail': 'Ancien et nouveau mot de passe requis.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        success = UtilisateurService.changer_mot_de_passe(request.user, ancien, nouveau)
        if success:
            return Response({'detail': 'Mot de passe mis à jour.'})
        return Response(
            {'detail': 'Ancien mot de passe incorrect.'},
            status=status.HTTP_400_BAD_REQUEST,
        )


# ─────────────────────────────────────────────
# Two Factor Authentication
# ─────────────────────────────────────────────

class TwoFactorAuthViewSet(viewsets.ViewSet):
    """
    Endpoints pour l'authentification à deux facteurs.
    GET    /api/2fa/status/              → statut 2FA
    POST   /api/2fa/enable/              → activer 2FA
    POST   /api/2fa/verify/              → vérifier code 2FA
    POST   /api/2fa/disable/             → désactiver 2FA
    POST   /api/2fa/regenerate-backup/   → régénérer codes de secours
    POST   /api/2fa/change-method/       → changer méthode (TOTP/EMAIL)
    """

    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def status(self, request):
        """
        GET /api/2fa/status/
        Retourne le statut de la 2FA pour l'utilisateur connecté.
        """
        try:
            two_fa = TwoFactorAuth.objects.get(utilisateur=request.user)
            serializer = TwoFactorAuthSerializer(two_fa)
            return Response(serializer.data)
        except TwoFactorAuth.DoesNotExist:
            return Response({
                'is_enabled': False,
                'methode': None,
                'backup_codes_count': 0,
            })

    @action(detail=False, methods=['post'])
    def enable(self, request):
        """
        POST /api/2fa/enable/
        Body : { "methode": "TOTP" } ou { "methode": "EMAIL" }

        Pour TOTP: retourne le secret et le QR code
        Pour EMAIL: envoie un code par email
        """
        serializer = Enable2FASerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        methode = serializer.validated_data['methode']
        user = request.user

        # Créer ou récupérer la config 2FA
        two_fa, created = TwoFactorAuth.objects.get_or_create(utilisateur=user)

        if methode == 'TOTP':
            # Générer secret TOTP et QR code
            secret = TwoFactorAuthService.generate_totp_secret()
            qr_code = TwoFactorAuthService.generate_qr_code(user, secret)
            backup_codes = TwoFactorAuthService.generate_backup_codes()

            two_fa.totp_secret = secret
            two_fa.backup_codes = backup_codes
            two_fa.methode = 'TOTP'
            two_fa.is_enabled = False  # Sera activé après vérification
            two_fa.save()

            return Response({
                'message': 'TOTP configuré. Veuillez scanner le QR code et vérifier avec un code.',
                'secret': secret,
                'qr_code': qr_code,
                'backup_codes': backup_codes,
                'methode': 'TOTP',
            })

        elif methode == 'EMAIL':
            # Générer et envoyer code par email
            code = TwoFactorAuthService.generate_email_code()
            TwoFactorAuthService.send_email_code(user, code)

            two_fa.email_code = code
            two_fa.email_code_created_at = timezone.now()
            two_fa.methode = 'EMAIL'
            two_fa.is_enabled = False  # Sera activé après vérification
            two_fa.save()

            return Response({
                'message': 'Code envoyé par email. Veuillez vérifier votre boîte de réception.',
                'methode': 'EMAIL',
            })

    @action(detail=False, methods=['post'])
    def verify(self, request):
        """
        POST /api/2fa/verify/
        Body : { "code": "123456" }

        Vérifie le code et active la 2FA si valide.
        """
        serializer = Verify2FACodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data['code']
        user = request.user

        try:
            two_fa = TwoFactorAuth.objects.get(utilisateur=user)
        except TwoFactorAuth.DoesNotExist:
            return Response(
                {'detail': '2FA non configurée. Veuillez d\'abord activer la 2FA.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Vérifier selon la méthode
        if two_fa.methode == 'TOTP':
            if two_fa.verify_totp(code):
                two_fa.is_enabled = True
                two_fa.mark_verified()
                return Response({
                    'message': '2FA activée avec succès.',
                    'backup_codes': two_fa.backup_codes,
                })
            else:
                return Response(
                    {'detail': 'Code TOTP invalide.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        elif two_fa.methode == 'EMAIL':
            if two_fa.is_email_code_valid(code):
                two_fa.is_enabled = True
                two_fa.mark_verified()
                backup_codes = TwoFactorAuthService.generate_backup_codes()
                two_fa.backup_codes = backup_codes
                two_fa.save()
                return Response({
                    'message': '2FA activée avec succès.',
                    'backup_codes': backup_codes,
                })
            else:
                return Response(
                    {'detail': 'Code email invalide ou expiré.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

    @action(detail=False, methods=['post'])
    def disable(self, request):
        """
        POST /api/2fa/disable/
        Body : { "code": "123456" } (code de vérification ou backup code)

        Désactive la 2FA après vérification.
        """
        code = request.data.get('code')
        if not code:
            return Response(
                {'detail': 'Code requis pour désactiver la 2FA.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            two_fa = TwoFactorAuth.objects.get(utilisateur=request.user)
        except TwoFactorAuth.DoesNotExist:
            return Response(
                {'detail': '2FA non activée.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Vérifier le code selon la méthode
        is_valid = False
        if two_fa.methode == 'TOTP':
            is_valid = two_fa.verify_totp(code) or two_fa.verify_backup_code(code)
        elif two_fa.methode == 'EMAIL':
            is_valid = two_fa.is_email_code_valid(code) or two_fa.verify_backup_code(code)

        if is_valid:
            two_fa.delete()
            return Response({'message': '2FA désactivée avec succès.'})
        else:
            return Response(
                {'detail': 'Code invalide.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=['post'])
    def regenerate_backup(self, request):
        """
        POST /api/2fa/regenerate-backup/
        Régénère les codes de secours (nécessite vérification).
        """
        try:
            two_fa = TwoFactorAuth.objects.get(utilisateur=request.user)
        except TwoFactorAuth.DoesNotExist:
            return Response(
                {'detail': '2FA non activée.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not two_fa.is_enabled:
            return Response(
                {'detail': '2FA non activée.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Régénérer les codes de secours
        backup_codes = TwoFactorAuthService.generate_backup_codes()
        two_fa.backup_codes = backup_codes
        two_fa.save()

        return Response({
            'message': 'Codes de secours régénérés.',
            'backup_codes': backup_codes,
        })

    @action(detail=False, methods=['post'])
    def change_method(self, request):
        """
        POST /api/2fa/change-method/
        Body : { "methode": "EMAIL" } ou { "methode": "TOTP" }

        Change la méthode 2FA (nécessite reconfiguration).
        """
        serializer = Change2FAMethodSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        methode = serializer.validated_data['methode']

        try:
            two_fa = TwoFactorAuth.objects.get(utilisateur=request.user)
        except TwoFactorAuth.DoesNotExist:
            return Response(
                {'detail': '2FA non configurée. Veuillez d\'abord activer la 2FA.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Désactiver temporairement et reconfigurer
        two_fa.is_enabled = False
        two_fa.methode = methode

        if methode == 'TOTP':
            secret = TwoFactorAuthService.generate_totp_secret()
            qr_code = TwoFactorAuthService.generate_qr_code(request.user, secret)
            two_fa.totp_secret = secret
            two_fa.save()

            return Response({
                'message': 'Méthode changée vers TOTP. Veuillez scanner le QR code et vérifier.',
                'secret': secret,
                'qr_code': qr_code,
                'methode': 'TOTP',
            })

        elif methode == 'EMAIL':
            code = TwoFactorAuthService.generate_email_code()
            TwoFactorAuthService.send_email_code(request.user, code)
            two_fa.email_code = code
            two_fa.email_code_created_at = timezone.now()
            two_fa.save()

            return Response({
                'message': 'Méthode changée vers EMAIL. Code envoyé par email.',
                'methode': 'EMAIL',
            })
