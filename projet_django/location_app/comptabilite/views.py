"""
Views — application comptabilite
"""

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import SystemeComptable
from .serializers import SystemeComptableSerializer
from .services import ComptabiliteService


import io
import pandas as pd
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import cm

class SystemeComptableViewSet(viewsets.ModelViewSet):
    """
    GET    /api/comptabilite/               → liste rapports
    POST   /api/comptabilite/               → créer un rapport
    GET    /api/comptabilite/{id}/          → détail
    POST   /api/comptabilite/{id}/calculer/ → recalculer bénéfice net
    GET    /api/comptabilite/{id}/export_pdf/ → export PDF
    GET    /api/comptabilite/{id}/export_csv/ → export CSV
    """

    queryset = SystemeComptable.objects.select_related('proprietaire').all()
    serializer_class = SystemeComptableSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk=None):
        """Génère un PDF du rapport comptable."""
        systeme = self.get_object()
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=18,
            alignment=1,
            spaceAfter=20,
            textColor=colors.HexColor('#FF385C')
        )
        
        elements = []
        elements.append(Paragraph(f"RAPPORT COMPTABLE - {systeme.proprietaire.nom}", title_style))
        elements.append(Spacer(1, 1*cm))
        
        elements.append(Paragraph(f"<b>Période :</b> du {systeme.periode_debut} au {systeme.periode_fin or 'Aujourd\'hui'}", styles['Normal']))
        elements.append(Spacer(1, 1*cm))
        
        # Tableau des chiffres
        data = [
            ["Description", "Montant (CFA)"],
            ["Total Revenus (Net Propriétaire)", f"{systeme.total_revenus:,.0f}"],
            ["Total Commission Administration", f"{systeme.total_commission_admin:,.0f}"],
            ["Total Dépenses", f"{systeme.total_depense:,.0f}"],
            ["BÉNÉFICE NET", f"{systeme.benefice_net:,.0f}"]
        ]
        
        t = Table(data, colWidths=[10*cm, 6*cm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#FF385C')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 12),
            ('BOTTOMPADDING', (0,0), (-1,0), 12),
            ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
            ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 1, colors.grey)
        ]))
        elements.append(t)
        
        doc.build(elements)
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="rapport_{systeme.id}.pdf"'
        response.write(buffer.getvalue())
        buffer.close()
        return response

    @action(detail=True, methods=['get'])
    def export_csv(self, request, pk=None):
        """Génère un CSV du rapport comptable."""
        systeme = self.get_object()
        data = {
            'Champ': ['ID', 'Propriétaire', 'Début Période', 'Fin Période', 'Total Revenus', 'Commission Admin', 'Dépenses', 'Bénéfice Net'],
            'Valeur': [
                systeme.id,
                f"{systeme.proprietaire.prenom} {systeme.proprietaire.nom}",
                systeme.periode_debut,
                systeme.periode_fin,
                systeme.total_revenus,
                systeme.total_commission_admin,
                systeme.total_depense,
                systeme.benefice_net
            ]
        }
        df = pd.DataFrame(data)
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="rapport_{systeme.id}.csv"'
        df.to_csv(path_or_buf=response, index=False, encoding='utf-8')
        return response

    @action(detail=True, methods=['post'])
    def calculer(self, request, pk=None):
        """POST /api/comptabilite/{id}/calculer/ — Recalcule le bénéfice net."""
        systeme = self.get_object()
        ComptabiliteService.recalculer(systeme)
        serializer = self.get_serializer(systeme)
        return Response({
            'detail': 'Rapport recalculé avec succès.',
            'rapport': serializer.data,
        })
