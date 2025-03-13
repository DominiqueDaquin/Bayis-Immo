from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import AnnonceView,MediaView

router=DefaultRouter()
router.register(r'annonces',AnnonceView)
router.register(r'medias',MediaView)
urlpatterns=[
path('',include(router.urls))
]