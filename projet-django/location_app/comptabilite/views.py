from rest_framework import generics, permissions
from .models import Paiement
from .serializers import PaiementSerializer

class PaiementCreateView(generics.CreateAPIView):
    queryset = Paiement.objects.all()
    serializer_class = PaiementSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(locataire=self.request.user)

class PaiementListView(generics.ListAPIView):
    serializer_class = PaiementSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Paiement.objects.filter(locataire=self.request.user)
