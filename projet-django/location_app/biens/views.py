from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Bien, Candidature
from .serializers import BienSerializer, CandidatureSerializer
from django.db.models import Q

class CandidatureCreateView(generics.CreateAPIView):
    queryset = Candidature.objects.all()
    serializer_class = CandidatureSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(locataire=self.request.user)

class CandidatureListView(generics.ListAPIView):
    serializer_class = CandidatureSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Candidature.objects.filter(locataire=self.request.user)

class BienListView(generics.ListAPIView):
    queryset = Bien.objects.all()
    serializer_class = BienSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtres
        quartier = self.request.query_params.get('quartier')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        type_bien = self.request.query_params.get('type_bien')
        
        if quartier:
            queryset = queryset.filter(quartier__icontains=quartier)
        if min_price:
            queryset = queryset.filter(prix__gte=min_price)
        if max_price:
            queryset = queryset.filter(prix__lte=max_price)
        if type_bien:
            queryset = queryset.filter(type_bien=type_bien)
            
        return queryset

class BienDetailView(generics.RetrieveAPIView):
    queryset = Bien.objects.all()
    serializer_class = BienSerializer
    permission_classes = (permissions.AllowAny,)
