"""
Gestion de l'authentification à deux facteurs (2FA)
Support TOTP (Google Authenticator) et Email
"""
import pyotp
import qrcode
import io
import base64
import secrets
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class TwoFactorAuthService:
    """Service pour gérer l'authentification à deux facteurs"""

    @staticmethod
    def generate_totp_secret():
        """Génère un secret TOTP pour Google Authenticator"""
        return pyotp.random_base32()

    @staticmethod
    def generate_qr_code(user, secret):
        """
        Génère un QR code pour Google Authenticator
        Retourne l'image en base64
        """
        # Créer l'URI TOTP
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=user.email,
            issuer_name='Location App'
        )

        # Générer le QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)

        # Convertir en image
        img = qr.make_image(fill_color="black", back_color="white")

        # Convertir en base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_base64 = base64.b64encode(buffer.getvalue()).decode()

        return f"data:image/png;base64,{img_base64}"

    @staticmethod
    def verify_totp_code(secret, code):
        """
        Vérifie un code TOTP (6 chiffres)
        Accepte les codes avec une fenêtre de ±1 intervalle (30 secondes)
        """
        totp = pyotp.TOTP(secret)
        return totp.verify(code, valid_window=1)

    @staticmethod
    def generate_backup_codes(count=10):
        """
        Génère des codes de récupération
        Format: XXXX-XXXX-XXXX
        """
        codes = []
        for _ in range(count):
            code = '-'.join([
                secrets.token_hex(2).upper(),
                secrets.token_hex(2).upper(),
                secrets.token_hex(2).upper()
            ])
            codes.append(code)
        return codes

    @staticmethod
    def generate_email_code():
        """Génère un code à 6 chiffres pour l'email"""
        return str(secrets.randbelow(1000000)).zfill(6)

    @staticmethod
    def send_email_code(user, code):
        """Envoie le code par email"""
        subject = 'Code de vérification - Location App'
        message = f"""
Bonjour {user.prenom} {user.nom},

Votre code de vérification est : {code}

Ce code est valide pendant 10 minutes.

Si vous n'avez pas demandé ce code, ignorez ce message.

Cordialement,
L'équipe Location App
        """

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

    @staticmethod
    def is_code_expired(created_at, validity_minutes=10):
        """Vérifie si un code email a expiré"""
        expiration_time = created_at + timedelta(minutes=validity_minutes)
        return timezone.now() > expiration_time
