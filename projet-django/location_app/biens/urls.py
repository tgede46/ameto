from django.urls import path
from .views import BienListView, BienDetailView, CandidatureCreateView, CandidatureListView

urlpatterns = [
    path('', BienListView.as_view(), name='bien_list'),
    path('<int:pk>/', BienDetailView.as_view(), name='bien_detail'),
    path('candidatures/', CandidatureListView.as_view(), name='candidature_list'),
    path('candidatures/create/', CandidatureCreateView.as_view(), name='candidature_create'),
]
