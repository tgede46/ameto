"""
Views — application comptabilite
"""

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import SystemeComptable
from .serializers import SystemeComptableSerializer
from .services import ComptabiliteService


class SystemeComptableViewSet(viewsets.ModelViewSet):
    """
    GET    /api/comptabilite/               → liste rapports
    POST   /api/comptabilite/               → créer un rapport
    GET    /api/comptabilite/{id}/          → détail
    POST   /api/comptabilite/{id}/calculer/ → recalculer bénéfice net
    """

    queryset = SystemeComptable.objects.select_related('proprietaire').all()
    serializer_class = SystemeComptableSerializer
    permission_classes = [permissions.IsAuthenticated]

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
