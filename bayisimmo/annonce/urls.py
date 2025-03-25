from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import AnnonceView,MediaView,MessageView,DiscussionView,AnnonceFavorisView,TombolaView,NotificationView,CommentaireView,NoteView,VueCreateAPIView,PubliciteView,LygosPaymentView,UnreadCountsAPIView

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

urlpatterns=[
path('',include(router.urls)),
path('vues/', VueCreateAPIView.as_view(), name='vue-create'),
path("paiement/lygos/", LygosPaymentView.as_view(), name="proxy-to-lygos"),
path("statistiques/",UnreadCountsAPIView.as_view()),
]