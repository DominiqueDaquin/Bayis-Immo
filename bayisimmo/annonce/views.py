from django.shortcuts import render
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from authentification.permissions import IsAnnonceur,IsAnnonceurOrReadOnly
from .models import (
    Annonce,
    Message,
    Media,
    Discussion                     
                     )
from .serializers import (
    AnnonceSerializer,
    MediaSerializer,
    MessageSerializer,
    
                          )

class AnnonceView(viewsets.ModelViewSet):

    """ 
    - Annonceur peut creer, modifier et voir les annonces
    - Client peut vopir les annonces
    """

    queryset=Annonce.objects.all()
    serializer_class=AnnonceSerializer
    permission_classes=[IsAnnonceurOrReadOnly]

    @action(detail=False,methods=['get'],permission_classes=[IsAnnonceur])
    def my_annonces(self,request):
        user=request.user
        annonces=Annonce.objects.filter(creer_par=user)
        serializer=self.get_serializer(annonces,many=True)
        return Response(serializer.data)

    def get_queryset(self):
        user=self.request.user
        if user.groups.filter(name="annonceur").exists():
            return Annonce.objects.all()
        else:
            return Annonce.objects.exclude(status='d')

    def perform_create(self, serializer):
            serializer.save(creer_par=self.request.user)

class MediaView(viewsets.ModelViewSet):
    queryset=Media.objects.all()
    serializer_class=MediaSerializer
    permission_classes=[IsAnnonceurOrReadOnly]


