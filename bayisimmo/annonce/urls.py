from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import AnnonceView,MediaView,MessageView,DiscussionView

router=DefaultRouter()
router.register(r'annonces',AnnonceView)
router.register(r'medias',MediaView)
router.register(r'messages',MessageView)
router.register(r'discussions',DiscussionView)
urlpatterns=[
path('',include(router.urls))
]