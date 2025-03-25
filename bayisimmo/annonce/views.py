from django.shortcuts import get_object_or_404, render
from django.db.models import Q
from django.conf import settings
import requests
from rest_framework import viewsets,status,generics
from django.core.exceptions import ObjectDoesNotExist


from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated,IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import NotFound
from authentification.permissions import IsAnnonceur,IsAnnonceurOrReadOnly
from django.contrib.auth import get_user_model

from django.utils import timezone


from .models import (
    Annonce,
    Message,
    Media,
    Discussion,
    AnnonceFavoris,
    Note,
    Tombola,
    Notification,
    Commentaire ,
    Publicite,
    UserTombola,
    Vue, 
                      
                     )
from .serializers import (
    AnnonceSerializer,
    MediaSerializer,
    MessageSerializer,
    DiscussionSerializer,
    AnnonceFavorisSerializer,
    NoteSerializer,
    TombolaSerializer,
    NotificationSerializer,
    CommentaireSerializer,
    VueSerializer,
    PubliciteSerializer,
    UserTombolaSerializer
                          )

class AnnonceView(viewsets.ModelViewSet):

    """ 
    - Annonceur peut creer, modifier et voir les annonces
    - Client peut vopir les annonces
    """

    queryset=Annonce.objects.all()
    serializer_class=AnnonceSerializer
    permission_classes=[IsAnnonceurOrReadOnly]
    # parser_classes = [MultiPartParser, FormParser]

    @action(detail=False,methods=['get'],permission_classes=[IsAnnonceur],url_path='mes-annonces')
    def my_annonces(self,request):
        user=request.user
        annonces=Annonce.objects.filter(creer_par=user)
        serializer=self.get_serializer(annonces,many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='commentaires', url_name='mes-commentaires')
    def get_commentaires(self, request, pk=None):
        """
        Récupère tous les commentaires d'une annonce spécifique.
        """
        try:
            annonce = Annonce.objects.get(id=pk) 
        except Annonce.DoesNotExist:
            raise NotFound("Annonce non trouvée")  

        commentaires = Commentaire.objects.filter(annonce=annonce).order_by("-creer_le")
        serializer = CommentaireSerializer(commentaires, many=True)

        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='note')
    def get_note(self, request, pk=None):
        """
        Récupère la note moyenne d'un article ainsi que la note donnée par l'utilisateur
        """
        user = request.user
        annonce = get_object_or_404(Annonce, pk=pk) 
        valeur=0
        moyenne=0
        try:
            user_note = Note.objects.get(user=user, annonce=annonce)
            user_note_valeur = user_note.valeur
            valeur=user_note_valeur
            moyenne = user_note.moyenne or 0
        except Note.DoesNotExist:
            valeur = 0  

            
        
        
        nombre_avis = Note.objects.filter(annonce=annonce).count()

        return Response({
            "user_note": valeur,
            "note": moyenne,
            "avis": nombre_avis
        })
    @action(detail=True,methods=['get'],url_path='is-favoris')
    def is_favoris(self,request,pk=None):
        """
        Diq si une annonce est dans les favoris de l'utilisateur
        """
        user=request.user
        try:
              is_favoris=False
              try:
                favori = AnnonceFavoris.objects.get(annonce=pk, user=user)
                is_favoris=True
              except ObjectDoesNotExist:
                favori = None 
              
              
              
              return Response({"is_favoris":is_favoris})
              
        except Exception as e:
              print(e)
              return Response({"detail":"Une erreur est survenue"})


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

class MessageView(viewsets.ModelViewSet):
    queryset=Message.objects.all()
    serializer_class=MessageSerializer

    def perform_create(self, serializer):
        
        message = serializer.save()
        if message.discussion.createur1==message.destinataire:
             sender=message.discussion.createur2
        else:
             sender=message.discussion.createur1
        texte=message.texte[:50]
        print(sender)
        Notification.objects.create(
            user=message.destinataire,  
            message=f"Vous avez recu un nouveau message de {sender}: {texte}..."
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    @action(detail=False, methods=['get'], url_path=r'non_lus/(?P<user_id>\d+)')
    def messages_non_lus(self, request, user_id=None):
            """
            Renvoie la liste des messages non lus pour un utilisateur spécifique.
            """
            User=get_user_model()
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"detail": "Utilisateur non trouvé."}, status=404)

            messages_non_lus = Message.objects.filter(status='e', destinataire=user) 

            serializer = self.get_serializer(messages_non_lus, many=True)
            return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path=r'pour_discussion/(?P<discussion_id>\d+)')
    def messages_pour_discussion(self, request, discussion_id=None):
            """
            Renvoie la liste des messages pour une discussion spécifique.
            """
            try:
                discussion = Discussion.objects.get(id=discussion_id)
            except Discussion.DoesNotExist:
                return Response({"detail": "Discussion non trouvée."}, status=404)

            
            messages = Message.objects.filter(discussion=discussion).order_by('envoyer_le')
            
            
            serializer = self.get_serializer(messages, many=True)
            return Response(serializer.data)

class DiscussionView(viewsets.ModelViewSet):
    queryset = Discussion.objects.all()
    serializer_class = DiscussionSerializer

    @action(detail=False, methods=['get'], url_path='mes-discussions')
    def mes_discussions(self, request):
        """Retourne toutes les discussions d'un utilisateur authentifié"""
        user = request.user
        discussions = Discussion.objects.filter(createur1=user) | Discussion.objects.filter(createur2=user)
        serializer = self.get_serializer(discussions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AnnonceFavorisView(viewsets.ModelViewSet):

    serializer_class=AnnonceFavorisSerializer
    queryset=AnnonceFavoris.objects.all()
    permission_classes=[IsAuthenticated]

    @action(detail=False,methods=['get'],url_path='mes-favoris')
    def get_favoris(self,request):
        user=request.user
        favoris=AnnonceFavoris.objects.filter(user=user)
        serializer=self.get_serializer(favoris,many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'], url_path='supprimer-favori')
    def delete_favori(self, request,pk=None):
        """
        Supprime un favori spécifique pour l'utilisateur connecté
        Nécessite l'ID de l'annonce dans les paramètres de requête
        """
        annonce_id = pk
        
        if not annonce_id:
            return Response(
                {"detail": "L'ID de l'annonce est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            favori = AnnonceFavoris.objects.get(
                user=request.user, 
                annonce_id=annonce_id
            )
            favori.delete()
            return Response(
                {"detail": "Favori supprimé avec succès"},
                status=status.HTTP_204_NO_CONTENT
            )
        except AnnonceFavoris.DoesNotExist:
            return Response(
                {"detail": "Favori non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )

    def get_queryset(self):
            user = self.request.user
            return AnnonceFavoris.objects.filter(user=user)

class TombolaView(viewsets.ModelViewSet):
    queryset = Tombola.objects.all()
    serializer_class = TombolaSerializer
    permission_classes=[IsAnnonceurOrReadOnly]

    @action(detail=False,methods=['get'],permission_classes=[IsAnnonceur],url_path="mes-tombolas")
    def get_tombolas(self,request):
        user=request.user
        tombolas=Tombola.objects.filter(creer_par=user)
        serializer=self.get_serializer(tombolas,many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='participer',permission_classes=[IsAuthenticated])
    def participer(self, request, pk=None):
            """
            Action permettant à un utilisateur de participer à une tombola.
            """
            tombola = Tombola.objects.get(id=pk)

            if tombola.statut != 'a':
                return Response({"detail": "La tombola n'est pas active."}, status=status.HTTP_400_BAD_REQUEST)

            if tombola.date_fin and tombola.date_fin < timezone.now().date():
                return Response({"detail": "La tombola est terminée."}, status=status.HTTP_400_BAD_REQUEST)

            user = request.user
            if UserTombola.objects.filter(user=user, tombola=tombola).exists():
                return Response({"detail": "Vous avez déjà participé à cette tombola."}, status=status.HTTP_400_BAD_REQUEST)

            UserTombola.objects.create(user=user, tombola=tombola)

            tombola.participants_actuel += 1
            tombola.save()

            return Response({"detail": "Vous avez participé à la tombola."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='verifier-participation',permission_classes=[IsAuthenticated])
    def verifier_participation(self, request, pk=None):
        """
        Action permettant de vérifier si un utilisateur a participé à une tombola.
        """
        tombola = self.get_object()
        user = request.user

        if UserTombola.objects.filter(user=user, tombola=tombola).exists():
            return Response({"detail": "Vous avez participé à cette tombola."}, status=status.HTTP_200_OK)

        return Response({"detail": "Vous n'avez pas participé à cette tombola."}, status=status.HTTP_404_NOT_FOUND)

    def perform_create(self, serializer):
            serializer.save(creer_par=self.request.user)

class NotificationView(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    
    @action(detail=False,methods=['get'],url_path='mes-notifications')
    def get_notification(self,request):
        user=request.user
        notification=Notification.objects.filter(user=user)
        serializer=self.get_serializer(notification,many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'Notification marked as read'})
    
class CommentaireView(viewsets.ModelViewSet):
    """
    ViewSet permettant de gérer les commentaires.
    - Authentification requise pour créer/modifier un commentaire.
    - Tous les utilisateurs peuvent voir les commentaires.
    """
    queryset = Commentaire.objects.all().order_by("-creer_le") 
    serializer_class = CommentaireSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  

    def perform_create(self, serializer):
        """
        Lorsqu'un utilisateur crée un commentaire, il est automatiquement associé à l'utilisateur connecté.
        """
        serializer.save(user=self.request.user)

class NoteView(viewsets.ModelViewSet):
    """
    ViewSet permettant de gérer les notes attribuées aux annonces.
    - Authentification requise pour créer/modifier une note.
    - Tous les utilisateurs peuvent voir les notes.
    """
    queryset = Note.objects.all().order_by("-id")  
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]  

    def perform_create(self, serializer):
        """
        Lorsqu'un utilisateur crée une note, elle est automatiquement associée à l'utilisateur connecté.
        """
        serializer.save(user=self.request.user)

class VueCreateAPIView(generics.CreateAPIView):
    """
    Permet de créer une vue pour un article.
    Accepte uniquement la méthode `POST`.
    """
    serializer_class = VueSerializer
    permission_classes = [IsAuthenticated]  

    def perform_create(self, serializer):
        article_id = self.request.data.get('article')
        article = Annonce.objects.filter(id=article_id).first()

        if not article:
            raise NotFound("Article non trouvé") 

        
        serializer.save(user=self.request.user, article=article)

class PubliciteView(viewsets.ModelViewSet):
    queryset = Publicite.objects.all().order_by('-date_creation') 
    serializer_class = PubliciteSerializer
    permission_classes = [IsAuthenticated,IsAnnonceurOrReadOnly]


    @action(detail=False,methods=['get'],permission_classes=[IsAnnonceur],url_path="mes-publicites")
    def get_publicites(self,request):
        user=request.user
        publicites=Publicite.objects.filter(user=user)
        serializer=self.get_serializer(publicites,many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        """Assigner automatiquement l'utilisateur connecté lors de la création."""
        serializer.save(user=self.request.user)

class LygosPaymentView(APIView):
    def post(self, request):
        url = "https://api.lygosapp.com/v1/gateway"
        headers = {
            "api-key": settings.LYGOS_API_KEY,  
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(url, json=request.data, headers=headers)
            return Response(response.json(), status=response.status_code)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)