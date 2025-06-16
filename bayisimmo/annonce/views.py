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
from rest_framework.parsers import MultiPartParser, FormParser,JSONParser
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
from django.template.loader import get_template
from xhtml2pdf import pisa
from io import BytesIO
from django.core.mail import EmailMessage
from django.http import HttpResponse
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
    DemandeBien,
    UserSubscription,
                      
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
    ParticipationSerializer,
    DemandeBienSerializer,
    UserSubscriptionSerializer,
                          )
User=get_user_model()

def send_mail_to_moderateur(subject,message):
        moderateurs = User.objects.filter(groups__name='moderateur')

        emails_moderateurs = [user.email for user in moderateurs if user.email]
        
        if emails_moderateurs:
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=emails_moderateurs
            )
            

def send_mail_to_annonceur(subject,message):
        moderateurs = User.objects.filter(groups__name='annonceur' )

        emails_moderateurs = [user.email for user in moderateurs if user.email]
        
        if emails_moderateurs:
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=emails_moderateurs
            )


class AnnonceView(viewsets.ModelViewSet):

    """ 
    - Annonceur peut creer, modifier et voir les annonces
    - Client peut vopir les annonces
    """

    queryset=Annonce.objects.all()
    serializer_class=AnnonceSerializer
    permission_classes=[IsAnnonceurOrReadOnly]
    parser_classes = [MultiPartParser, FormParser,JSONParser]

    @action(detail=False, methods=['get'], permission_classes=[IsAnnonceur], url_path='mes-annonces')
    def my_annonces(self, request):
        # Débogage pour vérifier les en-têtes d'authentification
        import logging
        logger = logging.getLogger('annonce')
        
        # Log de l'en-tête d'autorisation
        auth_header = request.META.get('HTTP_AUTHORIZATION', 'Non trouvé')
        logger.error(f"DEBUG - En-tête Authorization: {auth_header}")
        logger.error(f"DEBUG - User authentifié: {request.user.is_authenticated}")
        logger.error(f"DEBUG - Type d'utilisateur: {type(request.user).__name__}")
        
        # Gestion utilisateur non authentifié
        user = request.user
        if user.is_anonymous:
            logger.error("DEBUG - Utilisateur anonyme détecté, retour liste vide")
            return Response([])
        
        # Pour les utilisateurs authentifiés, continuer normalement
        try:
            annonces = Annonce.objects.annotate(
                priority=Case(
                    When(status='p', then=0),
                    default=1,
                    output_field=IntegerField()
                )
            ).filter(creer_par=user).order_by('priority')
            serializer = self.get_serializer(annonces, many=True)
            return Response(serializer.data)
        except Exception as e:
            # Capture toute erreur pour éviter les 500
            logger.error(f"DEBUG - Erreur lors de la récupération des annonces: {str(e)}")
            return Response({"error": str(e)}, status=500)

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
                )).exclude(status='p').order_by("priority","-creer_le")

    def perform_create(self, serializer):
            serializer.save(creer_par=self.request.user)
            try:
                send_mail_to_moderateur(
                    subject= "Nouvelle annonce Crée",
                    message=f" Une nouvelle annonce à été crée par {self.request.user.name} et est en attente de validation"
                )
            except Exception as e:
                print(e)

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


    def get_queryset(self):
        user=self.request.user
        
        if user.groups.filter(name="moderateur").exists():
            return Publicite.objects.annotate(
                statut_priority=Case(
                    When(statut='p', then=0),  
                    default=1,
                    output_field=IntegerField(),
                )
        ).filter(Q(is_payed=True) | Q(user=user) ).order_by('statut_priority','-date_creation')
        else:
            return Publicite.objects.filter(statut='a').order_by('-date_creation')


    def perform_create(self, serializer):
        """Assigner automatiquement l'utilisateur connecté lors de la création."""
        serializer.save(user=self.request.user)
        try:
            # annonce_id=self.request.get("annonce")
            # annonce=Annonce.objects.get(pk=annonce_id)
            # if annonce:
            #     annonce.status='s'
            #     annonce.save()
            send_mail_to_moderateur(
                    subject= "Nouvelle Publicité crée",
                    message=f" Une nouvelle publicité à été crée par {self.request.user.name} et est en attente de validation"
                )
        except Exception as e:
            print(e)
        
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
    filterset_fields = ['user', 'tombola']  

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
                ).order_by('date_inscription'),
                            'favoris_par_annonce':AnnonceFavoris.objects.filter(
                    annonce__creer_par=user.id
                ).values('annonce__titre', 'annonce_id').annotate(
                    nombre_vues=Count('id')
                ),
                'total_vues':Vue.objects.filter(annonce__creer_par=user.id).count(),
                'total_discussions':Discussion.objects.filter(createur2=user).count()
                            
                            
                            }
                            
            cache.set(cache_key, data, timeout=60)  
        
        return Response(data, status=status.HTTP_200_OK)

class DemandeBienViewSet(viewsets.ModelViewSet):
    queryset = DemandeBien.objects.all()
    serializer_class = DemandeBienSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Un utilisateur ne voit que ses propres demandes
        return self.queryset.filter(user=self.request.user).order_by('-date_creation')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        try:
            send_mail_to_annonceur(
    
                subject= f"🚨 Urgent - Nouvelle demande immobilière à pourvoir pour {self.request.user.email} 🏡",
                message=f" 🔥 Offre à saisir!  Un client recherche activement un  {serializer.type_bien_display} à {serializer.localisation},{serializer.ville}\n-budget:{serializer.budget_min}-{serializer.budget_max} Fcfa \n-superficie:{serializer.superficie_min}-{serializer.superficie_max} m2\n Le client a payer des frais de : {serializer.frais}"
                
            )

        except expression as identifier:
            print("erreur lors de l'envoie des mails aux moderateurs------ Demander bien")


    def update(self, request, *args, **kwargs):
        # Empêcher la modification des champs spécifiques
        if 'statut' in request.data and not request.user.is_staff:
            return Response(
                {"detail": "Vous ne pouvez pas modifier le statut de la demande."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def facture(self, request, pk=None):
        demande = self.get_object()
        
        # Rendre le template HTML
        template = get_template('facture_demande.html')
        context = {
            'demande': demande,
            'user': request.user
        }
        html = template.render(context)
        
        # Créer un PDF
        result = BytesIO()
        pdf = pisa.pisaDocument(BytesIO(html.encode("UTF-8")), result)
        
        if not pdf.err:
            response = HttpResponse(result.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="facture_demande_{demande.id}.pdf"'
            return response
        
        return HttpResponse("Erreur lors de la génération du PDF", status=500)


    @action(detail=False, methods=['post'])
    def envoyer_facture(self, request):
        demande_id = request.data.get('demande_id')
        try:
            demande = DemandeBien.objects.get(id=demande_id)
            
            # Générer le PDF en mémoire
            template = get_template('facture_demande.html')
            context = {
                'demande': demande,
                'user': request.user
            }
            html = template.render(context)
            pdf_buffer = BytesIO()
            pisa.pisaDocument(BytesIO(html.encode("UTF-8")), pdf_buffer)
            
            # Créer l'email
            email = EmailMessage(
                subject=f"Facture pour votre demande de bien #{demande.id}",
                body=f"""
                Bonjour {request.user.get_full_name() or request.user.username},
                
                Vous trouverez ci-joint la facture pour votre demande de bien immobilier.
                
                Détails de la demande:
                - Type: {demande.get_type_bien_display()}
                - Localisation: {demande.localisation}, {demande.ville}
                - Superficie: {demande.superficie_min} - {demande.superficie_max} m²
                - Budget: {demande.budget_min} - {demande.budget_max} FCFA
                - Frais: {demande.frais} FCFA
                
                Cordialement,
                L'équipe Bayis Immob
                """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[request.user.email],
            )
            
            # Attacher le PDF
            email.attach(
                f"facture_demande_{demande.id}.pdf",
                pdf_buffer.getvalue(),
                'application/pdf'
            )
            
            email.send()
            
            return Response(
                {"status": "success", "message": "Facture envoyée par email"},
                status=status.HTTP_200_OK
            )
            
        except DemandeBien.DoesNotExist:
            return Response(
                {"status": "error", "message": "Demande introuvable"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"status": "error", "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            


    
class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = UserSubscriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserSubscription.objects.filter(user=self.request.user).order_by('-start_date')


    @action(detail=False, methods=['post','get'])
    def subscribe(self, request):
        serializer = UserSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Désactiver les abonnements existants
        UserSubscription.objects.filter(user=request.user, is_active=True).update(is_active=False)
        
        # Créer le nouvel abonnement
        subscription = UserSubscription.objects.create(
            user=request.user,
            plan_type=serializer.validated_data['plan_type'],
            payment_reference=serializer.validated_data['payment_reference'],
            is_active=True,
            order_id=serializer.validated_data['order_id'],
        )
        
        return Response(
            UserSubscriptionSerializer(subscription, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )
    


    @action(detail=False, methods=['post','get'])
    def verify(self,request):
        user_subscription=UserSubscription.objects.filter(user=request.user, is_active=True)
        return Response({'order_id':user_subscription[0].order_id,'id':user_subscription[0].id})


    @action(detail=False, methods=['get'])
    def current(self, request):
        subscription = self.get_queryset().filter(is_active=True).first()
        if not subscription:
            return Response(
                {'detail': "Aucun abonnement actif"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)


    @action(detail=False, methods=['get'])
    def plans(self, request):
        plans = [
            {
                'plan_type': choice[0],
                'name': choice[1],
                'price': UserSubscription().price,
                'duration_days': {
                    'daily': 1,
                    'weekly': 7,
                    'monthly': 30
                }.get(choice[0], 0)
            }
            for choice in UserSubscription.PLAN_CHOICES
        ]
        return Response(plans)