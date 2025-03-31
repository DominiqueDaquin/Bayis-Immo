from django.shortcuts import get_object_or_404, render
from django.db.models import Q
from django.conf import settings
import requests
from rest_framework import viewsets,status,generics
from django.core.exceptions import ObjectDoesNotExist
from django.core.cache import cache
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated,IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import NotFound
from authentification.permissions import IsAnnonceur,IsAnnonceurOrReadOnly
from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone
from django.db.models import Case, When, IntegerField
from django.contrib.auth.models import AnonymousUser
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.core.mail import send_mail
from django.conf import settings
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
    UserTombolaSerializer,
    ParticipationSerializer
                          )
User=get_user_model()
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
        if user is None or isinstance(user, AnonymousUser) or not user.is_authenticated:
            return Response({
            "user_note": 0,
            "note": 0,
            "avis": 0
        })
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
        
        if user is None or isinstance(user, AnonymousUser) or not user.is_authenticated:
            return Response({"is_favoris": False})
        
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
      
        if user.groups.filter(name="moderateur").exists():
            return Annonce.objects.annotate(
                priority=Case(
                    When(status='p',then=0),
                    When(status='s',then=1),
                    default=2,
                    output_field=IntegerField()
                )
            ).order_by("priority","-creer_le")
        else:
            return Annonce.objects.annotate(
                priority=Case(
                    When(status='s',then=0),
                    When(status='a',then=1),
                    default=2,
                    output_field=IntegerField()
                )).order_by("priority","-creer_le")

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
        discussions = Discussion.objects.filter(
            models.Q(createur1=user) | models.Q(createur2=user)
        )
        
        for discussion in discussions:
            discussion.unread_count = discussion.messages.filter(
                destinataire=user,
                status='e'  
            ).count()
            discussion.un_read = discussion.unread_count > 0

        serializer = self.get_serializer(discussions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get','patch'], url_path='marquer-comme-lus')
    def discussion_messages(self, request, pk=None):
        """Récupère les messages d'une discussion et marque comme lus"""
        discussion = self.get_object()
        user = request.user

       
        Message.objects.filter(
            discussion=discussion,
            destinataire=user,
            status='e'  
        ).update(status='r')

        
        discussion.un_read = discussion.messages.filter(
            destinataire=user,
            status='e'
        ).exists()
        discussion.save()

        messages = discussion.messages.all().order_by('envoyer_le')
        serializer = MessageSerializer(messages, many=True)
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
    queryset = Tombola.objects.filter(statut='a')
    serializer_class = TombolaSerializer
    permission_classes=[IsAnnonceurOrReadOnly]

    def get_queryset(self):
        user=self.request.user
        
        if user.groups.filter(name="moderateur").exists():
            return Tombola.objects.annotate(
                statut_priority=Case(
                    When(statut='p', then=0),  
                    default=1,
                    output_field=IntegerField(),
                )
).order_by('statut_priority','-creer_le')
        else:
            return Tombola.objects.filter(statut='a').order_by('-creer_le')

    @action(detail=True, methods=['post'], url_path='paiement/(?P<order_id>[^/.]+)')
    def enregistrer_paiement(self, request, pk=None, order_id=None):
        user=request.user
        try:
            tombola=Tombola.objects.get(id=pk)
            user_tombola=UserTombola.objects.create(user=user,tombola=tombola)
            
            if user_tombola.user != request.user:
                return Response(
                    {"detail": "Vous n'avez pas la permission d'effectuer cette action."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            user_tombola.order_id = order_id
            user_tombola.is_payed = True
            user_tombola.is_active = True  
            user_tombola.save()
            serializer = self.get_serializer(user_tombola)
            return Response(serializer.data)
            
        except Publicite.DoesNotExist:
            return Response(
                {"detail": "Tombola non trouvée."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


    @action(detail=False,methods=['get'],permission_classes=[IsAnnonceur],url_path="mes-tombolas")
    def get_tombolas(self,request):
        user=request.user
        tombolas=Tombola.objects.filter(creer_par=user).order_by("-creer_le")
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
        annonce_id = self.request.data.get('annonce')
        annonce = Annonce.objects.filter(id=annonce_id).first()

        if not annonce:
            raise NotFound("annonce non trouvé") 

        
        serializer.save(user=self.request.user, annonce=annonce)

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

    @action(detail=True, methods=['post'], url_path='paiement/(?P<order_id>[^/.]+)')
    def enregistrer_paiement(self, request, pk=None, order_id=None):
        print("helllo")
        try:
            publicite = Publicite.objects.get(pk=pk)
            print("hello2")
            # Vérifier que la publicité appartient à l'utilisateur
            if publicite.user != request.user:
                return Response(
                    {"detail": "Vous n'avez pas la permission d'effectuer cette action."},
                    status=status.HTTP_403_FORBIDDEN
                )
            print("passe 1 success")
            # Mettre à jour la publicité
            publicite.order_id = order_id
            publicite.is_payed = True
            publicite.is_active = True  
            publicite.save()
            print("passe 2 success")
            serializer = self.get_serializer(publicite)
            return Response(serializer.data)
            
        except Publicite.DoesNotExist:
            return Response(
                {"detail": "Publicité non trouvée."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


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

        # Configuration spécifique pour PythonAnywhere
        session = requests.Session()
        
        # Solution 1: Désactivation complète du proxy
        session.trust_env = False
        
        # Solution alternative 2: Utilisation du proxy de PythonAnywhere si nécessaire
        # proxies = {
        #     'http': 'http://proxy.server:3128',
        #     'https': 'http://proxy.server:3128'
        # }

        try:
            response = session.post(
                url,
                json=request.data,
                headers=headers,
                timeout=30,  # Timeout augmenté pour PythonAnywhere
                # proxies=proxies  # À décommenter si vous utilisez la solution alternative
            )
            response.raise_for_status()
            return Response(response.json(), status=response.status_code)

        except requests.exceptions.RequestException as e:
            error_message = f"Erreur de connexion avec l'API Lygos: {str(e)}"
            return Response(
                {"error": error_message},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        

class LygosPaymentStatusView(APIView):
    def post(self, request):
        order_id = request.data.get("order_id")
        if not order_id:
            return Response({"error": "Order id requis"}, status=status.HTTP_400_BAD_REQUEST)
        
        url = f"https://api.lygosapp.com/v1/gateway/payin/{order_id}"
        headers = {
            "api-key": settings.LYGOS_API_KEY,  
            "Content-Type": "application/json",
        }
        
        try:
            response = requests.get(url, headers=headers)
            return Response(response.json(), status=response.status_code)
        
        except requests.RequestException as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserTombalaView(viewsets.ModelViewSet):
    queryset = UserTombola.objects.all()
    serializer_class = UserTombolaSerializer
    permission_classes = [IsAuthenticated]  

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return UserTombola.objects.filter(user=user)
        return UserTombola.objects.none() 
        
class UserParticipationsView(generics.ListAPIView):
    serializer_class = ParticipationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return UserTombola.objects.filter(user=user).select_related('tombola')


class SendMailView(APIView):
    def post(self, request, *args, **kwargs):
        objet=request.data.get("objet")
        body=request.data.get("body")
        email=request.data.get("email")
        reponse=send_mail(
            subject=objet,
            message=body,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email]
        )
        if reponse:
            return Response({"detail":"Email envoyé avec success"},status=status.HTTP_200_OK)
        
        return Response({"detail":"une erreur est survenue"},status=status.HTTP_400_BAD_REQUEST)


class StatistiquesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        cache_key = f'unread_counts_{user.id}'
        data = cache.get(cache_key)
        
        if data is None:
            data = {
                'unread_discussions': Discussion.objects.filter(
                    (Q(createur1=user) | Q(createur2=user)) &
                    Q(messages__destinataire=user) &
                    Q(messages__status='e')
                ).distinct().count(),
                'unread_notifications': Notification.objects.filter(
                    user=user.id,
                    is_read=False
                ).count(),
                'annonces_actives':Annonce.objects.filter(
                    Q(creer_par=user.id) & Q(status='a')
                ).count(),
                'publicites_actives':Publicite.objects.filter(
                    Q(user=user.id) & Q(is_active=True)
                ).count(),
                'annonces_vues': Vue.objects.filter(annonce__creer_par=user.id).count(),
                'vues_par_annonces': Vue.objects.filter(
                    annonce__creer_par=user.id
                ).values('annonce__titre', 'annonce_id').annotate(
                    nombre_vues=Count('id')
                ),
                'users_par_date': User.objects.annotate(
    date_inscription=TruncDate('date_joined')
).values('date_inscription').annotate(
    nombre_utilisateurs=Count('id')
).order_by('date_inscription')
                            }
            cache.set(cache_key, data, timeout=60)  
        
        return Response(data, status=status.HTTP_200_OK)