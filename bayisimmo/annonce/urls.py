from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import (AnnonceView,MediaView,MessageView,DiscussionView,AnnonceFavorisView,TombolaView,
                    NotificationView,CommentaireView,NoteView,VueCreateAPIView,PubliciteView,LygosPaymentView,
                    StatistiquesAPIView,LygosPaymentStatusView,UserTombalaView,UserParticipationsView ,SendMailView,DemandeBienViewSet )

router=DefaultRouter()
router.register(r'annonces',AnnonceView)
router.register(r'medias',MediaView)
router.register(r'messages',MessageView)
router.register(r'discussions',DiscussionView)
router.register(r'favoris',AnnonceFavorisView)
router.register(r'tombolas',TombolaView)
router.register(r'notifications', NotificationView, basename='notifications')
router.register(r'commentaires', CommentaireView)
router.register(r'notes', NoteView)
router.register(r'publicites', PubliciteView)
router.register(r'user-tombolas',UserTombalaView)
router.register(r'demandes-biens', DemandeBienViewSet, basename='demande-bien')
urlpatterns=[
path('',include(router.urls)),
path('vues/', VueCreateAPIView.as_view(), name='vue-create'),
path("paiement/lygos/", LygosPaymentView.as_view(), name="proxy-to-lygos"),
path("paiement/lygos/status/", LygosPaymentStatusView.as_view()),
path("statistiques/",StatistiquesAPIView.as_view()),
path("users/participations/",UserParticipationsView.as_view()),
path("send-mail/",SendMailView.as_view())


]