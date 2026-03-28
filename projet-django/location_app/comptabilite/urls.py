from django.urls import path
from .views import PaiementCreateView, PaiementListView

urlpatterns = [
    path('paiements/', PaiementListView.as_view(), name='paiement_list'),
    path('paiements/create/', PaiementCreateView.as_view(), name='paiement_create'),
]
